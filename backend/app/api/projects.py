from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.ai.project_generator import generate_project_details

router = APIRouter(prefix="/projects", tags=["Project Generator"])

class ProjectGenerateReq(BaseModel):
    name: str
    description: str

@router.post("/generate")
async def api_generate_project(
    payload: ProjectGenerateReq
):
    name = payload.name.strip()
    description = payload.description.strip()
    
    if not name or not description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both project name and description are required."
        )
        
    result = await generate_project_details(name=name, description=description)
    return result
