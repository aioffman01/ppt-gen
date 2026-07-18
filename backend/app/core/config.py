import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "PPT Reference Vault"
    
    # Base directory paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    FONT_DIR: Path = BASE_DIR.parent / "FONT"
    TEMPLATE_DIR: Path = BASE_DIR.parent / "TEMPLATE"
    DESIGN_MD_DIR: Path = BASE_DIR.parent / "DESIGN_MD"
    
    # SQLite Configuration
    SQLALCHEMY_DATABASE_URL: str = f"sqlite:///{BASE_DIR}/app.db"
    
    class Config:
        case_sensitive = True

settings = Settings()

# Ensure target directories exist
os.makedirs(settings.FONT_DIR, exist_ok=True)
os.makedirs(settings.TEMPLATE_DIR, exist_ok=True)
os.makedirs(settings.DESIGN_MD_DIR, exist_ok=True)


