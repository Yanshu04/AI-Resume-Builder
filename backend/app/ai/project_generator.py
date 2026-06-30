from app.utils.ollama_client import query_ollama
import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

async def generate_project_details(name: str, description: str) -> Dict[str, Any]:
    """
    Generates a full project documentation package (description, stack, bullets, README, and portfolio text) via Ollama.
    """
    system_prompt = (
        "You are an expert software architect and technical writer.\n"
        "Generate a structured project documentation package based on the project name and description.\n"
        "Output ONLY a valid JSON object matching the requested schema. Do not add any conversational text or markdown code wrapper blocks."
    )

    prompt = f"""
Project Name: {name}
Project Short Description: {description}

Please generate a project documentation package matching this JSON schema exactly:
{{
  "full_description": "A detailed 3-4 sentence professional summary of the project's architecture, components, and value proposition.",
  "tech_stack": ["Technology1", "Technology2", "Technology3", "Technology4"],
  "bullets": [
    "Resume bullet point 1 starting with a strong action verb (e.g., Architected, Spearheaded) describing technical development.",
    "Resume bullet point 2 starting with a strong action verb highlighting optimization, performance, or metrics.",
    "Resume bullet point 3 starting with a strong action verb focusing on deployment, testing, or API integration."
  ],
  "readme_draft": "A complete, beautiful Markdown GitHub README draft with sections like # Project Name, ## Features, ## Tech Stack, and ## Installation.",
  "portfolio_description": "A longer, narrative-style case study description (2-3 paragraphs) detailing the engineering challenges solved, architectural decisions, and database/performance trade-offs.",
  "linkedin_post": "An engaging, professionally formatted LinkedIn post (with emojis and hashtags) describing the project, why you built it, the tech stack, and what you learned."
}}
"""

    try:
        response = await query_ollama(prompt=prompt, system_prompt=system_prompt)
        clean_json = response.strip()
        
        # Strip markdown codeblocks if Ollama wraps the JSON
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[1].split("```")[0].strip()
            
        start_idx = clean_json.find("{")
        end_idx = clean_json.rfind("}")
        if start_idx != -1 and end_idx != -1:
            clean_json = clean_json[start_idx:end_idx+1]
            
        project_data = json.loads(clean_json)
        return project_data
        
    except Exception as e:
        logger.error(f"Error generating or parsing project JSON: {str(e)}. Using fail-safe fallback.")
        # Fallback dictionary if JSON parsing or Ollama call fails
        fallback_stack = ["Python", "FastAPI", "React", "Docker", "PostgreSQL"]
        fallback_post = (
            f"🚀 I'm thrilled to share my latest project: {name}!\n\n"
            f"Designed to solve key challenges in {description or 'modern software systems'}, "
            f"this system features a highly scalable backend architecture coupled with a responsive frontend interface.\n\n"
            f"🛠️ Tech Stack:\n"
            f"- Backend: FastAPI (Python)\n"
            f"- Frontend: React (TypeScript)\n"
            f"- Infrastructure: Docker / Containerization\n"
            f"- Database: PostgreSQL\n\n"
            f"Check it out! #FastAPI #ReactJS #Docker #PostgreSQL #SoftwareEngineering"
        )
        return {
            "full_description": f"An innovative software solution named {name} built to address key challenges in {description or 'modern software systems'}. It features a highly scalable backend architecture coupled with a responsive, modern frontend interface.",
            "tech_stack": fallback_stack,
            "bullets": [
                f"Architected and developed the core system modules of {name} using FastAPI, enhancing API response speeds.",
                f"Integrated secure database persistence layers and custom queries, reducing latency for high-throughput client requests.",
                f"Containerized the entire application suite using Docker, establishing robust CI/CD deployment pipelines."
            ],
            "readme_draft": f"# {name}\n\n{description or 'A software engineering project.'}\n\n## Tech Stack\n- Backend: FastAPI (Python)\n- Frontend: React (TypeScript)\n- Database: PostgreSQL\n\n## Getting Started\n1. Clone the repository\n2. Run `docker compose up --build` to start all services.",
            "portfolio_description": f"The development of {name} was centered around building a highly cohesive and robust system. Given the requirements for {description or 'scalable solutions'}, the architecture was built using a service-oriented approach. PostgreSQL was chosen as the main data store due to its ACID compliance and capability to handle complex relational schemas.\n\nThroughout the project, key trade-offs were made regarding caching and database query optimization. Indexing strategies were utilized to maintain stable performance profiles under high simulated workloads. This case study demonstrates proficiency in end-to-end full-stack software development and deployment.",
            "linkedin_post": fallback_post
        }
