from flask import Flask
from flask_migrate import Migrate
from app.config.config import Config
from app.initialize_functions import initialize_route, initialize_db, initialize_swagger
from app.db.db import db
from app.db.models import User
import logging
from dotenv import load_dotenv

try:
    load_dotenv()
except Exception as e:
    print(f"Nie udało się załadować pliku .env: {e}")

def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    initialize_db(app)
    migrate = Migrate(app, db)

    initialize_route(app)

    initialize_swagger(app)

    if not app.debug:
        logging.basicConfig(level=logging.INFO)

    return app
