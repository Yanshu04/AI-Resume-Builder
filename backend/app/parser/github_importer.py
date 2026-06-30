import httpx
import logging
import json
from typing import List, Dict, Any
from app.utils.ollama_client import query_ollama

logger = logging.getLogger(__name__)

async def import_github_projects(username: str) -> List[Dict[str, Any]]:
    """
    Fetches the user's public repositories from the GitHub API and utilizes
    Ollama to structure the top 3 projects into professional resume items.
    """
    url = f"https://api.github.com/users/{username}/repos?sort=updated&per_page=12"
    headers = {"User-Agent": "AI-Resume-Builder-Importer"}
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url, headers=headers)
            if response.status_code != 200:
                logger.error(f"GitHub API returned error code {response.status_code}: {response.text}")
                return []
            repos = response.json()
        except Exception as e:
            logger.error(f"GitHub API request failed: {str(e)}")
            return []

    raw_projects = []
    for r in repos:
        # Filter out forked repositories to capture original work
        if r.get("fork"):
            continue
            
        name = r.get("name", "")
        desc = r.get("description", "") or "A public software repository."
        lang = r.get("language", "")
        
        tech_stack = [lang] if lang else []
        if r.get("topics"):
            tech_stack.extend(r.get("topics"))
            
        # Deduplicate and limit tech stack tags
        tech_stack = list(set([t.capitalize() for t in tech_stack if t]))[:4]

        raw_projects.append({
            "id": f"gh_{r.get('id')}",
            "name": name,
            "description": desc,
            "tech_stack": tech_stack,
            "bullets": [
                f"Developed and maintained open-source codebase for {name}.",
                f"Published public repository featuring: {desc}"
            ]
        })

    if not raw_projects:
        return []

    # Send top 3 projects to Ollama to write professional bullet points
    target_projects = raw_projects[:3]
    
    system_prompt = (
        "You are an expert technical resume writer.\n"
        "Convert the raw GitHub repository information into polished, professional resume project sections.\n"
        "Output ONLY a valid JSON list matching the schema. Do not add any conversational text."
    )

    prompt = f"""
GitHub Repositories:
{json.dumps(target_projects, indent=2)}

Please polish these projects and write 2 action-oriented resume bullets for each (detailing development, stack, and outcome).
Format the output strictly as a JSON array of objects matching this schema:
[
  {{
    "id": "original_id",
    "name": "Project Name",
    "description": "Short description of project",
    "tech_stack": ["React", "FastAPI"],
    "bullets": [
      "Engineered... using...",
      "Optimized... resulting in..."
    ]
  }}
]
"""

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
            
        polished_projects = json.loads(clean_json)
        return polished_projects
        
    except Exception as e:
        logger.error(f"Failed to polish Github projects via LLM: {str(e)}. Using fallback raw projects.")
        return target_projects
