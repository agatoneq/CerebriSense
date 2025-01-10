from flask import Blueprint, request, jsonify
from app.db.db import db
from app.db.models import Patient, ProcessedFile
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
        # Wyszukaj pacjenta po ID
        patient = Patient.query.get(patient_id)

        # Sprawdź, czy pacjent istnieje
        if not patient:
            return jsonify({"error": "Pacjent nie istnieje"}), 404

        # Sprawdź, czy pacjent należy do lekarza
        if patient.doctor_id != doctor_id:
            return jsonify({"error": "Brak dostępu do tego pacjenta"}), 403

        # Pobierz przetworzone pliki przypisane do pacjenta
        processed_files = ProcessedFile.query.filter_by(patient_id=patient.id).all()
        processed_files_list = [
            {
                "file_path": file.file_path,
                "file_name": file.file_name,
                "created_at": file.created_at.strftime("%Y-%m-%d %H:%M:%S")
            }
            for file in processed_files
        ]

        # Przygotuj dane pacjenta do zwrócenia
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
