from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any
from app.ai.jd_optimizer import optimize_resume_for_jd

router = APIRouter(prefix="/optimize", tags=["Job Description Optimizer"])

class OptimizeRequest(BaseModel):
    resume_json: Dict[str, Any]
    jd_text: str

@router.post("")
async def api_optimize_resume(
    payload: OptimizeRequest
):
    jd_text = payload.jd_text.strip()
    resume_json = payload.resume_json

    if not jd_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text cannot be empty."
        )

    if not resume_json:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume JSON cannot be empty."
        )

    result = await optimize_resume_for_jd(resume_json=resume_json, jd_text=jd_text)
    return result
