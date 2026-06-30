from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/resume_builder"

    OLLAMA_BASE_URL: str = "http://ollama:11434"
    OLLAMA_MODEL: str = "qwen2.5:1.5b"
    OLLAMA_TIMEOUT: float = 60.0

    # Local storage configurations
    STORAGE_DIR: str = "uploads"
    EXPORTS_DIR: str = "exports"

    STORAGE_TYPE: str = "local"
    LOCAL_STORAGE_DIR: str = "storage"
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_BUCKET: str = "resumes"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
