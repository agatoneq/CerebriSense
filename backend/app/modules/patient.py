from flask import Blueprint, request, jsonify
from app.db.db import db
from app.db.models import Patient
import os

patients_bp = Blueprint("patients", __name__, url_prefix="/api/v1/patients")

@patients_bp.route("/add", methods=["POST"])
def add_patient():
    try:
        name = request.form.get("name")
        age = request.form.get("age")
        gender = request.form.get("gender")
        diagnosis = request.form.get("diagnosis")
        file = request.files.get("file")

        if not all([name, age, gender, file]):
            return jsonify({"error": "Wszystkie pola (oprócz diagnozy) są wymagane!"}), 400

        file_path = os.path.join("uploads", file.filename)
        os.makedirs("uploads", exist_ok=True)
        file.save(file_path)

        new_patient = Patient(
            name=name,
            age=int(age),
            gender=gender,
            diagnosis=diagnosis,
            eeg_file=file_path
        )
        db.session.add(new_patient)
        db.session.commit()

        return jsonify({"message": "Pacjent dodany pomyślnie!"}), 201

    except Exception as e:
        return jsonify({"error": f"Błąd serwera: {str(e)}"}), 500

@patients_bp.route("/", methods=["GET"])
def get_patients():
    try:
        patients = Patient.query.all()
        patients_data = [
            {
                "id": patient.id,
                "name": patient.name,
                "age": patient.age,
                "gender": patient.gender,
                "diagnosis": patient.diagnosis,
                "eeg_file": patient.eeg_file,
            }
            for patient in patients
        ]
        return jsonify(patients_data), 200

    except Exception as e:
        return jsonify({"error": f"Błąd serwera: {str(e)}"}), 500
