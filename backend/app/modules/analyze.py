from flask import Blueprint, request, jsonify
from app.db.db import db
from app.db.models import ProcessedFile, AnalysisResult
import os
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import load_model
import numpy as np
import shap
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

analyze_bp = Blueprint("analyze", __name__, url_prefix="/api/v1/analyze")

base_path = os.path.abspath(os.path.dirname(__file__))
time_path = os.path.join(base_path, "..", "files", "time.csv")
columns_path = os.path.join(base_path, "..", "files", "columnLabels.csv")
erp_data_path = os.path.join(base_path, "..", "files", "ERPdata.csv")
demographic_path = os.path.join(base_path, "..", "files", "demographic.csv")

erp_data = pd.read_csv(erp_data_path)
demographic = pd.read_csv(demographic_path)
time = pd.read_csv(time_path)
columns = pd.read_csv(columns_path)

label_map = demographic.set_index('subject')[' group'].to_dict()
erp_data['group'] = erp_data['subject'].map(label_map)

scaler = StandardScaler()
erp_data.iloc[:, 2:11] = scaler.fit_transform(erp_data.iloc[:, 2:11])
erp_data_filtered = erp_data[(erp_data['time_ms'] >= -100) & (erp_data['time_ms'] <= 100)]
aggregated_data = erp_data_filtered.groupby(['subject', 'group']).mean().reset_index()

X = aggregated_data.iloc[:, 3:].values
y = aggregated_data['group'].values
X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, stratify=y, random_state=42)
X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, stratify=y_temp, random_state=42)

model_path = os.path.join(base_path, "..", "files", "schizophrenia_classification_model_v3.keras")
model = load_model(model_path)
explainer = shap.KernelExplainer(model.predict, X_train)

selected_electrodes = ['Fz', 'FCz', 'Cz', 'FC3', 'FC4', 'C3', 'C4', 'CP3', 'CP4']

def process_and_save_erp(patient_file, output_file, time, columns, selected_electrodes):
    try:
        data = pd.read_csv(patient_file, header=None)
        data.columns = columns.columns

        erp_data = (
            data.groupby(['subject', 'condition', 'sample'])[selected_electrodes]
            .mean()
            .reset_index()
        )

        erp_data = erp_data.merge(time, on='sample', how='left')
        erp_data.columns = erp_data.columns.str.strip()

        erp_data.to_csv(output_file, index=False)
        return output_file
    except Exception as e:
        raise Exception(f"Błąd podczas przetwarzania pliku EEG: {str(e)}")
    
    

def prepare_patient_data(patient_file_path, X_train, scaler):
    try:
        patient_data = pd.read_csv(patient_file_path)
        patient_data.columns = patient_data.columns.str.strip()
        expected_columns = ['Fz', 'FCz', 'Cz', 'FC3', 'FC4', 'C3', 'C4', 'CP3', 'CP4']
        patient_filtered = patient_data[(patient_data['time_ms'] >= -100) & (patient_data['time_ms'] <= 100)]
        signal_columns = patient_filtered[expected_columns]
        patient_filtered[expected_columns] = scaler.transform(signal_columns)
        patient_features = patient_filtered[expected_columns].mean().values

        if len(patient_features) < X_train.shape[1]:
            missing_features = X_train.shape[1] - len(patient_features)
            patient_features = np.pad(patient_features, (0, missing_features), constant_values=0)
        return patient_features.reshape(1, -1)
    except Exception as e:
        raise ValueError(f"Błąd podczas przygotowywania danych pacjenta: {str(e)}")

def predict_patient(patient_file_path, model, X_train, scaler):
    patient_features = prepare_patient_data(patient_file_path, X_train, scaler)
    prediction_prob = model.predict(patient_features)[0][0]
    if prediction_prob < 0.1:
        classification_text = "Niemalże zerowe prawdopodobieństwo schizofrenii"
    elif prediction_prob < 0.4:
        classification_text = "Bardzo niskie prawdopodobieństwo schizofrenii"
    elif 0.4 <= prediction_prob < 0.6:
        classification_text = "Umiarkowane prawdopodobieństwo schizofrenii"
    elif 0.6 <= prediction_prob <= 0.75:
        classification_text = "Duże prawdopodobieństwo schizofrenii"
    else:
        classification_text = "Najwyższe prawdopodobieństwo schizofrenii"
    return prediction_prob, classification_text, patient_features

def generate_report(shap_values, feature_names, prediction_prob):
    report = []
    shap_values = np.array(shap_values).flatten()
    report.append(f"Predykcja modelu (prawdopodobieństwo choroby): {prediction_prob:.3f}\n")
    report.append("\nSzczegółowy wpływ cech na wynik:")

    for feature, value in zip(feature_names, shap_values):
        if feature == "time_ms":
            continue
        impact = "zwiększa" if value > 0 else "zmniejsza" if value < 0 else "nie ma wpływu na"
        report.append(f"  - {feature}: {impact} predykcję o {abs(value):.3f}")
    return "\n".join(report)

@analyze_bp.route("/file/<int:file_id>", methods=["POST"])
def analyze_file(file_id):
    try:
        logger.info(f"Analiza pliku o ID: {file_id}")
        processed_file = ProcessedFile.query.get(file_id)
        if not processed_file:
            return jsonify({"error": "Nie znaleziono przetworzonego pliku."}), 404

        existing_result = AnalysisResult.query.filter_by(file_id=file_id).first()
        if existing_result:
            return jsonify({
                "file_id": existing_result.file_id,
                "probability": existing_result.probability,
                "classification": existing_result.classification,
                "report": existing_result.shap_report
            }), 200

        file_path = processed_file.file_path
        if not os.path.exists(file_path):
            return jsonify({"error": "Plik nie istnieje na serwerze."}), 400

        probability, classification, patient_features = predict_patient(file_path, model, X_train, scaler)
        probability = float(probability)
        shap_values = explainer.shap_values(patient_features)[0]
        feature_names = aggregated_data.columns[3:].tolist()
        report = generate_report(shap_values, feature_names, probability)

        analysis_result = AnalysisResult(
            file_id=file_id,
            probability=probability,
            classification=classification,
            shap_report=report
        )
        db.session.add(analysis_result)
        db.session.commit()

        return jsonify({
            "file_id": file_id,
            "probability": probability,
            "classification": classification,
            "report": report
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Wystąpił błąd podczas analizy pliku: {str(e)}"}), 500


@analyze_bp.route("/report/<int:file_id>", methods=["GET"])
def fetch_report(file_id):
    try:
        analysis_result = AnalysisResult.query.filter_by(file_id=file_id).first()
        if not analysis_result:
            return jsonify({"error": "Nie znaleziono wyników dla tego pliku."}), 404

        return jsonify({
            "file_id": file_id,
            "shap_report": analysis_result.shap_report
        }), 200
    except Exception as e:
        return jsonify({"error": f"Wystąpił błąd: {str(e)}"}), 500
    
    
@analyze_bp.route("/temporary", methods=["POST"])
def analyze_temporary_file():
    try:
        raw_eeg_file = request.files.get("raw_eeg_file")
        if not raw_eeg_file:
            logger.error("Nie przesłano pliku EEG.")
            return jsonify({"error": "Nie przesłano pliku EEG."}), 400

        temp_folder = "temp/"
        os.makedirs(temp_folder, exist_ok=True)
        temp_file_path = os.path.join(temp_folder, raw_eeg_file.filename)
        raw_eeg_file.save(temp_file_path)
        logger.info(f"Plik EEG zapisany tymczasowo: {temp_file_path}")

        processed_file_path = os.path.join(temp_folder, "processed_temp.csv")
        try:
            process_and_save_erp(temp_file_path, processed_file_path, time, columns, selected_electrodes)
            logger.info(f"Plik EEG został przetworzony: {processed_file_path}")
        except Exception as e:
            logger.error(f"Błąd podczas przetwarzania pliku EEG: {str(e)}")
            return jsonify({"error": f"Błąd podczas przetwarzania pliku EEG: {str(e)}"}), 500

        try:
            probability, classification, patient_features = predict_patient(
                processed_file_path, model, X_train, scaler
            )
            shap_values = explainer.shap_values(patient_features)[0]
            feature_names = aggregated_data.columns[3:].tolist()
            report = generate_report(shap_values, feature_names, float(probability))
        except Exception as e:
            logger.error(f"Błąd podczas analizy pliku EEG: {str(e)}")
            return jsonify({"error": f"Błąd podczas analizy pliku EEG: {str(e)}"}), 500

        os.remove(temp_file_path)
        os.remove(processed_file_path)

        return jsonify({
            "probability": float(probability),
            "classification": classification,
            "report": report
        }), 200

    except Exception as e:
        logger.exception("Wystąpił błąd podczas analizy tymczasowego pliku.")
        return jsonify({"error": f"Wystąpił błąd: {str(e)}"}), 500
