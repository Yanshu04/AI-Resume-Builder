from app.utils.ollama_client import query_ollama
import json
import logging
from typing import List

logger = logging.getLogger(__name__)

async def generate_skills_suggestions(current_skills: List[str], role: str, jd: str = "") -> List[str]:
    """
    Suggests relevant skills to add based on current skills, target role, and job description.
    """
    system_prompt = (
        "You are an expert technical recruiter. Suggest relevant skills to add to a resume.\n"
        "Output ONLY a valid JSON list of strings (e.g. [\"Docker\", \"SQL\"]). Do not output conversational filler."
    )
    
    prompt = (
        f"Current Skills: {json.dumps(current_skills)}\n"
        f"Target Role: {role}\n"
        f"Job Description Context: {jd}\n\n"
        "Instructions:\n"
        "- Suggest 5 to 8 skills, frameworks, or tools that would complement the candidate's profile and match the role.\n"
        "- Output the suggestions strictly as a JSON array of strings.\n"
        "Generate suggestions now:"
    )
    
    try:
        response = await query_ollama(prompt=prompt, system_prompt=system_prompt)
        clean_json = response.strip()
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[1].split("```")[0].strip()
            
        start_idx = clean_json.find("[")
        end_idx = clean_json.rfind("]")
        if start_idx != -1 and end_idx != -1:
            clean_json = clean_json[start_idx:end_idx+1]
            
        suggestions = json.loads(clean_json)
        if isinstance(suggestions, list):
            return [str(s) for s in suggestions]
        return []
    except Exception as e:
        logger.error(f"Error generating or parsing skill suggestions: {str(e)}")
        # Return fallback recommendations based on role
        fallbacks = {
            "frontend": ["React", "TypeScript", "Tailwind CSS", "Next.js", "Redux", "Webpack", "Jest"],
            "backend": ["Python", "FastAPI", "PostgreSQL", "Docker", "REST APIs", "Redis", "AWS"],
            "fullstack": ["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Docker", "Git"],
            "data": ["Python", "SQL", "Pandas", "PyTorch", "Spark", "Tableau", "Git"]
        }
        matched_role = role.lower()
        for k, v in fallbacks.items():
            if k in matched_role:
                return v
        return ["Git", "Docker", "REST APIs", "CI/CD", "SQL"]
