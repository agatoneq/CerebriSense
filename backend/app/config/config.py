import os

class Config:
    DEBUG = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.environ.get('DEBUG_SQL', 'False') == 'True'
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-secret-key')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://schizoscreen_user:pass@localhost/schizoscreen'

# class DevelopmentConfig(BaseConfig):
#     """Development configuration."""
#     DEBUG = True
#     SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or 'postgresql://schizoscreen_user:pass@localhost/schizoscreen_dev'

# class TestingConfig(BaseConfig):
#     """Testing configuration."""
#     DEBUG = True
#     TESTING = True
#     SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL') or 'sqlite:///testing.db'

# class ProductionConfig(BaseConfig):
#     """Production configuration."""
#     DEBUG = False
#     SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'postgresql://schizoscreen_user:pass@localhost/schizoscreen_prod'

# def get_config_by_name(config_name):
#     """ Get config by name """
#     if config_name == 'development':
#         return DevelopmentConfig()
#     elif config_name == 'production':
#         return ProductionConfig()
#     elif config_name == 'testing':
#         return TestingConfig()
#     else:
#         return DevelopmentConfig()
