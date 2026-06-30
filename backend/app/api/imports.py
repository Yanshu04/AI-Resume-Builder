from fastapi import APIRouter, HTTPException, status, File, UploadFile
from pydantic import BaseModel
from app.parser.resume_parser import parse_resume_file
from app.parser.github_importer import import_github_projects
from app.parser.linkedin_importer import parse_linkedin_export

router = APIRouter(prefix="/import", tags=["Profile Import Utilities"])

class GitHubImportRequest(BaseModel):
    username: str

@router.post("/resume")
async def import_resume(
    file: UploadFile = File(...)
):
    """
    Accepts PDF or DOCX file, extracts text, structures into resume JSON.
    """
    content = await file.read()
    try:
        resume_json = await parse_resume_file(content, file.filename)
        return {"resume_json": resume_json}
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while parsing: {str(e)}"
        )

@router.post("/github")
async def import_github(
    payload: GitHubImportRequest
):
    """
    Fetches public repositories for a username, polishes into resume projects.
    """
    username = payload.username.strip()
    if not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub username is required."
        )
    projects = await import_github_projects(username)
    return {"projects": projects}

@router.post("/linkedin")
async def import_linkedin(
    file: UploadFile = File(...)
):
    """
    Accepts LinkedIn data export ZIP, extracts profile details, maps to resume JSON.
    """
    content = await file.read()
    try:
        resume_json = await parse_linkedin_export(content)
        return {"resume_json": resume_json}
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while parsing: {str(e)}"
        )
