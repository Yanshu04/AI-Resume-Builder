from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.utils.db import get_db
from app.models.chat_session import ChatSession, ChatMessageIn, ChatMessageOut, GenerateResumeOut
from app.ai.chat_engine import handle_chat_turn, INITIAL_PROMPT
from app.ai.resume_generator import generate_resume_json

router = APIRouter(prefix="/chat", tags=["Chat Resume Builder"])

@router.post("", response_model=ChatMessageOut)
async def chat_message(
    payload: ChatMessageIn,
    db: AsyncSession = Depends(get_db)
):
    session_id = payload.session_id
    message = payload.message.strip()

    # Look up existing session
    result = await db.execute(select(ChatSession).where(ChatSession.session_id == session_id))
    session = result.scalars().first()

    # If session doesn't exist, initialize it and return the first greeting/question
    if not session:
        try:
            session = ChatSession(
                session_id=session_id,
                current_step="profession",
                answers={}
            )
            db.add(session)
            await db.commit()
        except Exception:
            await db.rollback()
            # Re-fetch session created concurrently
            result = await db.execute(select(ChatSession).where(ChatSession.session_id == session_id))
            session = result.scalars().first()
            if not session:
                raise
        
        return {
            "session_id": session_id,
            "reply": INITIAL_PROMPT,
            "current_step": "profession",
            "is_complete": False
        }

    # If session exists and user sent "START" (to re-initialize or fetch greeting), return welcome
    if message.upper() == "START" and not session.answers:
        return {
            "session_id": session_id,
            "reply": INITIAL_PROMPT,
            "current_step": "profession",
            "is_complete": False
        }

    if not message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty."
        )

    # Process turn
    reply, next_step, is_complete = await handle_chat_turn(session, message)
    
    # Save the updated session state
    db.add(session)
    await db.commit()

    return {
        "session_id": session_id,
        "reply": reply,
        "current_step": next_step,
        "is_complete": is_complete
    }

@router.post("/generate", response_model=GenerateResumeOut)
async def generate_resume(
    payload: ChatMessageIn,
    db: AsyncSession = Depends(get_db)
):
    session_id = payload.session_id
    result = await db.execute(select(ChatSession).where(ChatSession.session_id == session_id))
    session = result.scalars().first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found. Please start a session first."
        )

    # Generate the resume JSON using Ollama
    resume_json = await generate_resume_json(session.answers, "candidate@email.com")
    
    return {
        "session_id": session_id,
        "resume_json": resume_json
    }
