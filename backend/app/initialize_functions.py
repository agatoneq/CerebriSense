from flask import Flask
from flasgger import Swagger
from app.modules.main.route import main_bp
from app.db.db import db

def initialize_db(app: Flask):
    with app.app_context():
        db.init_app(app)   
        
def initialize_route(app: Flask):
    try:
        with app.app_context():
            app.register_blueprint(main_bp, url_prefix='/api/v1/main')
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
