from flask import Blueprint, request, jsonify
from app.db.db import db
from app.db.models import Patient

patients_bp = Blueprint("patients", __name__, url_prefix="/api/v1/patients")

@patients_bp.route("/add", methods=["POST"])
def add_patient():
    data = request.get_json()

    try:
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        group = data.get("group", 2)
        gender = data.get("gender")
        note = data.get("note", "")
        raw_eeg_file = data.get("raw_eeg_file")

        if not first_name or not last_name or not gender:
            return jsonify({"error": "Wszystkie wymagane pola muszą być uzupełnione"}), 400

        new_patient = Patient(
            first_name=first_name,
            last_name=last_name,
            group=group,
            gender=gender,
            notes=[note] if note else [],
            raw_eeg_file=raw_eeg_file,
        )

        db.session.add(new_patient)
        db.session.commit()

        return jsonify({"message": "Pacjent dodany pomyślnie!"}), 201

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
                "raw_eeg_file": patient.raw_eeg_file,
                "processed_eeg_file": patient.processed_eeg_file,
                "model_result": patient.model_result,
            }
            for patient in patients
        ]

        return jsonify({"patients": patients_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
