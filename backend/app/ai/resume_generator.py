from app.utils.ollama_client import query_ollama
import json
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

async def generate_resume_json(answers: Dict[str, str], email: str) -> Dict[str, Any]:
    """
    Takes raw interview answers and structures them into a polished resume JSON via Ollama.
    """
    system_prompt = (
        "You are an expert resume writer. Synthesize the provided raw interview answers into a complete, professional, production-ready resume JSON.\n"
        "You must strictly output raw JSON matching the requested schema. Do not include any conversational filler, markdown formatting, or explanations."
    )

    prompt = f"""
Candidate Email: {email}
Interview Answers: {json.dumps(answers, indent=2)}

Please compile this raw candidate information into a highly professional resume JSON. 
Ensure you write polished, action-oriented resume bullets with business impact and metrics where possible.

The response must be valid JSON matching this schema exactly:
{{
  "personal_info": {{
    "name": "Professional Candidate",
    "email": "{email}",
    "phone": "555-0100",
    "location": "San Francisco, CA",
    "linkedin": "linkedin.com/in/candidate",
    "github": "github.com/candidate"
  }},
  "summary": "Professional summary paragraph (3 sentences max) highlighting core expertise and value proposition.",
  "experience": [
    {{
      "company": "Enterprise Corporation",
      "position": "Target Position Title",
      "period": "2022 - Present",
      "bullets": [
        "Polished bullet point with action verbs describing key achievements.",
        "Second polished bullet point highlighting performance, tech stack used, and business outcome."
      ]
    }}
  ],
  "projects": [
    {{
      "name": "Project Name",
      "description": "Short description of the system or application.",
      "tech_stack": ["React", "FastAPI", "PostgreSQL"],
      "bullets": [
        "Bullet outlining technical implementation details and scalability wins.",
        "Bullet outlining impact, optimization, or metrics."
      ]
    }}
  ],
  "skills": {{
    "languages": ["Python", "TypeScript", "SQL"],
    "frameworks": ["FastAPI", "React", "Next.js"],
    "tools": ["Docker", "Git", "Ollama"]
  }},
  "education": [
    {{
      "institution": "State University",
      "degree": "Bachelor of Science in Computer Science",
      "year": "2021"
    }}
  ],
  "achievements": [
    "Quantified professional achievement (e.g. Optimized database queries, reducing response times by 35%)",
    "Secondary achievement or recognition"
  ]
}}
"""

    try:
        raw_response = await query_ollama(prompt=prompt, system_prompt=system_prompt)
        
        # Robust JSON extraction
        clean_json = raw_response.strip()
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[1].split("```")[0].strip()
            
        start_idx = clean_json.find("{")
        end_idx = clean_json.rfind("}")
        if start_idx != -1 and end_idx != -1:
            clean_json = clean_json[start_idx:end_idx+1]
            
        resume_data = json.loads(clean_json)
        return resume_data
        
    except Exception as e:
        logger.error(f"Error generating or parsing resume JSON: {str(e)}. Using fallback mapper.")
        # Fail-safe default generator mapping answers directly to schemas
        return {
            "personal_info": {
                "name": "Professional Candidate",
                "email": email,
                "phone": "555-0100",
                "location": "San Francisco, CA",
                "linkedin": "linkedin.com/in/candidate",
                "github": "github.com/candidate"
            },
            "summary": f"A dedicated professional specialized in {answers.get('profession', 'Software Engineering')}.",
            "experience": [
                {
                    "company": "Technology Solutions Inc.",
                    "position": answers.get('profession', 'Software Engineer'),
                    "period": "2021 - Present",
                    "bullets": [
                        answers.get('experience', 'Responsible for design and deployment of core business logic.'),
                        "Collaborated with cross-functional teams to integrate software applications and API services."
                    ]
                }
            ],
            "projects": [
                {
                    "name": "Core Project Portfolio",
                    "description": answers.get('project', 'A complex software solution solving high-demand problems.'),
                    "tech_stack": [s.strip() for s in answers.get('skills', 'Python, React').split(',') if s.strip()][:4],
                    "bullets": [
                        "Architected and implemented responsive modules and components.",
                        "Optimized overall backend response latency and processing."
                    ]
                }
            ],
            "skills": {
                "languages": [s.strip() for s in answers.get('skills', 'JavaScript, Python').split(',') if s.strip()][:3],
                "frameworks": ["FastAPI", "React"],
                "tools": ["Git", "Docker"]
            },
            "education": [
                {
                    "institution": "University / Institute",
                    "degree": answers.get('education', 'Bachelor of Science in Computer Science'),
                    "year": "2020"
                }
            ],
            "achievements": [
                answers.get('achievements', 'Successfully optimized project deliverables.'),
                "Awarded certificate of recognition for engineering performance."
            ]
        }
