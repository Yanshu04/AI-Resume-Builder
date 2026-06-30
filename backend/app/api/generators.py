from fastapi import APIRouter
from typing import List, Optional
from pydantic import BaseModel
from app.ai.summary_prompt import generate_summary
from app.ai.bullet_prompt import generate_polished_bullet
from app.ai.experience_prompt import generate_rewritten_experience
from app.ai.achievement_prompt import generate_quantified_achievement
from app.ai.skills_prompt import generate_skills_suggestions

router = APIRouter(prefix="/generators", tags=["AI Content Generators"])

# Request Schemas
class SummaryReq(BaseModel):
    role: str
    key_skills: Optional[str] = ""

class BulletReq(BaseModel):
    rough_bullet: str
    context: Optional[str] = ""

class ExperienceReq(BaseModel):
    rough_text: str

class AchievementReq(BaseModel):
    raw_achievement: str

class SkillsReq(BaseModel):
    current_skills: List[str]
    role: str
    jd: Optional[str] = ""

# API Endpoints
@router.post("/summary")
async def api_summary(payload: SummaryReq):
    result = await generate_summary(role=payload.role, key_skills=payload.key_skills)
    return {"summary": result}

@router.post("/bullet")
async def api_bullet(payload: BulletReq):
    result = await generate_polished_bullet(rough_bullet=payload.rough_bullet, context=payload.context)
    return {"bullet": result}

@router.post("/experience")
async def api_experience(payload: ExperienceReq):
    result = await generate_rewritten_experience(rough_text=payload.rough_text)
    return {"experience": result}

@router.post("/achievement")
async def api_achievement(payload: AchievementReq):
    result = await generate_quantified_achievement(raw_achievement=payload.raw_achievement)
    return {"achievement": result}

@router.post("/skills/suggest")
async def api_skills(payload: SkillsReq):
    result = await generate_skills_suggestions(
        current_skills=payload.current_skills, 
        role=payload.role, 
        jd=payload.jd
    )
    return {"suggested_skills": result}
