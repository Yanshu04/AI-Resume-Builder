from datetime import datetime
from sqlalchemy import String, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.utils.db import Base
from pydantic import BaseModel
from typing import Dict, Any

class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    resume_json: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

# Pydantic schema for editing or saving
class ResumeUpdate(BaseModel):
    resume_json: Dict[str, Any]

class ResumeOrderPatch(BaseModel):
    resume_json: Dict[str, Any]
