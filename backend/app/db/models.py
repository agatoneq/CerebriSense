from app.db.db import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Patient(db.Model):
    __tablename__ = "patients"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(128), nullable=False)
    last_name = db.Column(db.String(128), nullable=False)
    group = db.Column(db.Integer, default=2)
    gender = db.Column(db.String(1), nullable=False)
    notes = db.Column(JSON, default=[])
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    processed_files = db.relationship("ProcessedFile", backref="patient", lazy=True)


class ProcessedFile(db.Model):
    __tablename__ = "processed_files"
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("patients.id"), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    file_name = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class AnalysisResult(db.Model):
    __tablename__ = "analysis_results"
    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer, db.ForeignKey("processed_files.id"), nullable=False)
    probability = db.Column(db.Float, nullable=False)
    classification = db.Column(db.String(255), nullable=False)
    shap_report = db.Column(db.Text, nullable=True)
    processed_file = db.relationship("ProcessedFile", backref="analysis_results")
    