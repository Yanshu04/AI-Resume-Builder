from datetime import datetime
from sqlalchemy import String, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.utils.db import Base
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    current_step: Mapped[str] = mapped_column(String(50), default="profession", nullable=False)
    answers: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

# Pydantic Schemas for API requests & responses
class ChatMessageIn(BaseModel):
    session_id: str
    message: str

class ChatMessageOut(BaseModel):
    session_id: str
    reply: str
    current_step: str
    is_complete: bool

class GenerateResumeOut(BaseModel):
    session_id: str
    resume_json: Dict[str, Any]
