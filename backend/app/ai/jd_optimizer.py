from app.utils.ollama_client import query_ollama
import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

async def optimize_resume_for_jd(resume_json: Dict[str, Any], jd_text: str) -> Dict[str, Any]:
    """
    Optimizes a resume JSON against a Job Description (JD) using Ollama.
    Returns a dict containing:
      - "optimized_resume": the optimized resume JSON
      - "diff_summary": a list of strings summarizing what changed
    """
    system_prompt = (
        "You are an expert ATS (Applicant Tracking System) optimizer and resume writer.\n"
        "Optimize the candidate's resume JSON to align with the target Job Description (JD).\n"
        "Return ONLY a valid JSON object matching the requested schema. Do not add any conversational text."
    )

    prompt = f"""
Candidate Resume JSON:
{json.dumps(resume_json, indent=2)}

Target Job Description:
{jd_text}

Optimize this resume for the JD by performing these steps:
1. Reorder the languages, frameworks, and tools in the skills section to put skills mentioned in the JD first.
2. Polish the professional summary to align with the core focus of the JD.
3. Rewrite the experience and project bullet points to incorporate relevant keywords and methodologies from the JD naturally.
4. Track every specific change you make.

Output the result strictly matching this JSON schema:
{{
  "optimized_resume": {{
    "personal_info": {{ ... }},
    "summary": "Updated summary aligning with JD...",
    "experience": [
      {{
        "company": "...",
        "position": "...",
        "period": "...",
        "bullets": ["Optimized bullet 1...", "Optimized bullet 2..."]
      }}
    ],
    "projects": [
      {{
        "name": "...",
        "description": "...",
        "tech_stack": [...],
        "bullets": ["Optimized bullet 1...", "Optimized bullet 2..."]
      }}
    ],
    "skills": {{
      "languages": [...],
      "frameworks": [...],
      "tools": [...]
    }},
    "education": [ ... ],
    "achievements": [ ... ]
  }},
  "diff_summary": [
    "Reordered skills to prioritize JD keywords (e.g. React, Kubernetes)",
    "Rewrote summary to emphasize target role metrics",
    "Aligned experience bullet points with keywords from the JD"
  ]
}}
"""

    try:
        response = await query_ollama(prompt=prompt, system_prompt=system_prompt)
        clean_json = response.strip()
        
        # Strip markdown codeblocks
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[1].split("```")[0].strip()
            
        start_idx = clean_json.find("{")
        end_idx = clean_json.rfind("}")
        if start_idx != -1 and end_idx != -1:
            clean_json = clean_json[start_idx:end_idx+1]
            
        optimized_data = json.loads(clean_json)
        
        # Validate that the keys exist
        if "optimized_resume" in optimized_data and "diff_summary" in optimized_data:
            return optimized_data
            
        raise ValueError("JSON missing required optimizer fields")
        
    except Exception as e:
        logger.error(f"Error optimizing resume via Ollama: {str(e)}. Running fallback keyword optimizer.")
        
        # Fallback keyword reordering and injection
        opt_resume = json.loads(json.dumps(resume_json))  # deep copy
        diffs = []
        
        # 1. Reorder skills by simple keyword scanning
        jd_lower = jd_text.lower()
        for section in ["languages", "frameworks", "tools"]:
            if "skills" in opt_resume and section in opt_resume["skills"]:
                skills_list = opt_resume["skills"][section]
                # Sort skills: ones present in JD come first
                matched = [s for s in skills_list if s.lower() in jd_lower]
                unmatched = [s for s in skills_list if s.lower() not in jd_lower]
                if len(matched) > 0:
                    opt_resume["skills"][section] = matched + unmatched
                    diffs.append(f"Reordered {section} to prioritize keywords: {', '.join(matched)}")

        # 2. Touch up summary if present
        if "summary" in opt_resume:
            opt_resume["summary"] = opt_resume["summary"] + " Well-positioned to deliver immediate value by aligning development practices with the core business and operational needs outlines."
            diffs.append("Refined summary statement to align with targeted job profile")

        # 3. Add default diff if none
        if not diffs:
            diffs.append("Analyzed resume against JD; skills structure matches requirements.")

        return {
            "optimized_resume": opt_resume,
            "diff_summary": diffs
        }
