from app.db.db import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.dialects.postgresql import JSON

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
    group = db.Column(db.Integer, default=2)  # 0 - zdrowy, 1 - schizofrenia, 2 - nieznane
    gender = db.Column(db.String(1), nullable=False)
    notes = db.Column(db.JSON, default=[])
    raw_eeg_file = db.Column(db.String(255))
    processed_eeg_file = db.Column(db.String(255))
    model_result = db.Column(db.Integer) 
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'))