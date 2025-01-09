from flask import Blueprint, request, jsonify
from app.db.db import db
from app.db.models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "Wszystkie pola są wymagane!"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Użytkownik o tym emailu już istnieje!"}), 409

    new_user = User(name=name, email=email)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Rejestracja zakończona sukcesem!"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "E-mail i hasło są wymagane!"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Nieprawidłowy e-mail lub hasło!"}), 401

    # Jeśli logowanie zakończy się sukcesem
    return jsonify({"message": "Zalogowano pomyślnie!", "id": user.id}), 200