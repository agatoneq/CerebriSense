from flask import Flask
from flasgger import Swagger
from app.db.db import db
from app.modules.main.route import main_bp
from app.modules.auth import auth_bp
from app.modules.patient import patients_bp
from app.modules.analyze import analyze_bp

def initialize_db(app: Flask):
    with app.app_context():
        db.init_app(app)

def initialize_route(app: Flask):
    try:
        with app.app_context():
            app.register_blueprint(main_bp, url_prefix='/api/v1/main')
            app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
            app.register_blueprint(patients_bp, url_prefix='/api/v1/patients')
            app.register_blueprint(analyze_bp, url_prefix='/api/v1/analyze')
    except Exception as e:
        print(f"Błąd rejestracji tras: {e}")

def initialize_swagger(app: Flask):
    if app.config.get("DEBUG"):
        try:
            with app.app_context():
                swagger = Swagger(app)
                return swagger
        except Exception as e:
            print(f"Błąd inicjalizacji Swaggera: {e}")
