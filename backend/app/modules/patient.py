from flask import Blueprint, request, jsonify
from app.db.db import db
from app.db.models import Patient, ProcessedFile, AnalysisResult
import os
import pandas as pd
from sklearn.preprocessing import StandardScaler
from datetime import datetime

patients_bp = Blueprint("patients", __name__, url_prefix="/api/v1/patients")

base_path = os.path.abspath(os.path.dirname(__file__))
time_path = os.path.join(base_path, "..", "files", "time.csv")
columns_path = os.path.join(base_path, "..", "files", "columnLabels.csv")

time = pd.read_csv(time_path)
columns = pd.read_csv(columns_path)

selected_electrodes = ['Fz', 'FCz', 'Cz', 'FC3', 'FC4', 'C3', 'C4', 'CP3', 'CP4']
scaler = StandardScaler()

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


@patients_bp.route("/add", methods=["POST"])
def add_patient():
    try:
        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")
        group = request.form.get("group", 2)
        gender = request.form.get("gender")
        doctor_id = request.form.get("doctor_id")
        raw_eeg_file = request.files.get("raw_eeg_file")
        file_name = request.form.get("file_name", f"{first_name}_{last_name}_ERP")

        if not first_name or not last_name or not gender or not raw_eeg_file:
            return jsonify({"error": "Wszystkie wymagane pola muszą być uzupełnione"}), 400

        temp_folder = "temp/"
        os.makedirs(temp_folder, exist_ok=True)
        temp_file_path = os.path.join(temp_folder, raw_eeg_file.filename)
        raw_eeg_file.save(temp_file_path)

        patient_folder = os.path.join("uploads", f"{first_name}_{last_name}")
        os.makedirs(patient_folder, exist_ok=True)

        processed_file_path = os.path.join(patient_folder, f"{file_name}.csv")
        processed_file_path = processed_file_path.replace("\\", "/")

        process_and_save_erp(temp_file_path, processed_file_path, time, columns, selected_electrodes)
        os.remove(temp_file_path)

        new_patient = Patient(
            first_name=first_name,
            last_name=last_name,
            group=group,
            gender=gender,
            doctor_id=doctor_id,
            created_at=datetime.utcnow()
        )
        db.session.add(new_patient)
        db.session.commit()

        processed_file = ProcessedFile(
            patient_id=new_patient.id,
            file_path=processed_file_path,
            file_name=file_name,
            created_at=datetime.utcnow()
        )
        db.session.add(processed_file)
        db.session.commit()

        return jsonify({"message": "Pacjent i przetworzony plik EEG dodani pomyślnie!"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@patients_bp.route("/", methods=["GET"])
def get_patients():
    try:
        patients = Patient.query.all()

        patients_list = [
            {
                "id": patient.id,
                "first_name": patient.first_name,
                "last_name": patient.last_name,
                "group": patient.group,
                "gender": patient.gender,
                "notes": patient.notes,
                "doctor_id": patient.doctor_id,
                "processed_files": [
                    {
                        "file_path": processed_file.file_path,
                        "file_name": processed_file.file_name,
                        "created_at": processed_file.created_at.strftime("%Y-%m-%d %H:%M:%S")
                    }
                    for processed_file in patient.processed_files
                ]
            }
            for patient in patients
        ]

        return jsonify({"patients": patients_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@patients_bp.route("/<int:doctor_id>/<int:patient_id>", methods=["GET"])
def get_patient(doctor_id, patient_id):
    try:
        patient = Patient.query.get(patient_id)

        if not patient:
            return jsonify({"error": "Pacjent nie istnieje"}), 404

        if patient.doctor_id != doctor_id:
            return jsonify({"error": "Brak dostępu do tego pacjenta"}), 403

        processed_files = ProcessedFile.query.filter_by(patient_id=patient.id).all()
        processed_files_list = [
            {
                "id": file.id,
                "file_path": file.file_path,
                "file_name": file.file_name,
                "created_at": file.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "analyzed": AnalysisResult.query.filter_by(file_id=file.id).first() is not None
            }
            for file in processed_files
        ]

        patient_data = {
            "id": patient.id,
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "group": int(patient.group),
            "gender": patient.gender,
            "notes": patient.notes or [],
            "processed_files": processed_files_list,
            "created_at": patient.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }

        return jsonify({"patient": patient_data}), 200

    except Exception as e:
        print("Błąd:", e)
        return jsonify({"error": str(e)}), 500
    
    
@patients_bp.route("/<int:patient_id>/add_note", methods=["POST"])
def add_note_to_patient(patient_id):
    try:
        note = request.json.get("note")
        if not note:
            return jsonify({"error": "Notatka nie może być pusta."}), 400

        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({"error": "Pacjent nie istnieje."}), 404

        updated_notes = patient.notes or []
        updated_notes.append(note)
        patient.notes = updated_notes
        db.session.commit()

        return jsonify({"message": "Notatka została dodana pomyślnie."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@patients_bp.route("/<int:patient_id>/upload_file", methods=["POST"])
def upload_file(patient_id):
    try:
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({"error": "Pacjent nie istnieje."}), 404

        raw_eeg_file = request.files.get("raw_eeg_file")
        file_name = request.form.get("file_name", raw_eeg_file.filename)

        if not raw_eeg_file:
            return jsonify({"error": "Brak pliku do wgrania."}), 400

        patient_folder = os.path.join("uploads", f"{patient.first_name}_{patient.last_name}")
        os.makedirs(patient_folder, exist_ok=True)

        temp_folder = "temp/"
        os.makedirs(temp_folder, exist_ok=True)
        temp_file_path = os.path.join(temp_folder, raw_eeg_file.filename)
        raw_eeg_file.save(temp_file_path)

        processed_file_path = os.path.join(patient_folder, f"{file_name}.csv")
        processed_file_path = processed_file_path.replace("\\", "/")

        process_and_save_erp(temp_file_path, processed_file_path, time, columns, selected_electrodes)

        os.remove(temp_file_path)

        new_file = ProcessedFile(
            patient_id=patient.id,
            file_path=processed_file_path,
            file_name=file_name,
            created_at=datetime.utcnow(),
        )
        db.session.add(new_file)
        db.session.commit()

        return jsonify({
            "message": "Plik EEG został wgrany i przetworzony pomyślnie.",
            "file": {
                "id": new_file.id,
                "file_name": new_file.file_name,
                "created_at": new_file.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            },
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
