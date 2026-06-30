import zipfile
import io
import logging
import json
from typing import Dict, Any
from app.utils.ollama_client import query_ollama

logger = logging.getLogger(__name__)

async def parse_linkedin_export(zip_bytes: bytes) -> Dict[str, Any]:
    """
    Parses a LinkedIn data export ZIP, extracts positions, education,
    and skills CSV files, and structures them into a resume JSON via Ollama.
    """
    csv_data = {}
    
    try:
        # Extract files from uploaded ZIP
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
            for name in z.namelist():
                # Normalize filename to check base files
                base_name = name.split("/")[-1].lower()
                if base_name in ["positions.csv", "education.csv", "skills.csv", "profile.csv"]:
                    csv_data[base_name] = z.read(name).decode("utf-8", errors="ignore")
                    
    except Exception as e:
        logger.error(f"Error extracting ZIP archive for LinkedIn import: {str(e)}")
        raise ValueError(f"Could not open ZIP archive: {str(e)}")

    if not csv_data:
        raise ValueError(
            "No relevant LinkedIn profile data found. "
            "Please ensure the ZIP contains files like 'Positions.csv', 'Education.csv', or 'Skills.csv'."
        )

    # Compile the raw text of the files for parsing
    combined_text = ""
    for file_name, text in csv_data.items():
        # Limit individual files to prevent context token overflows
        combined_text += f"=== {file_name.upper()} ===\n{text[:1500]}\n\n"

    system_prompt = (
        "You are an expert resume parser.\n"
        "Convert the raw LinkedIn CSV data into a complete, structured resume JSON matching the requested schema.\n"
        "Output ONLY a valid JSON object matching the requested schema. Do not add any conversational text."
    )

    prompt = f"""
LinkedIn CSV Export Data:
{combined_text}

Please compile this raw LinkedIn history into a highly structured resume JSON.
Format the output strictly according to this JSON schema:
{{
  "personal_info": {{
    "name": "Candidate Full Name (extract from Profile.csv or text)",
    "email": "Email (default to candidate@email.com)",
    "phone": "Phone (default to '')",
    "location": "City, State",
    "linkedin": "LinkedIn profile link",
    "github": ""
  }},
  "summary": "Professional summary statement (2-3 sentences based on profile/positions)",
  "experience": [
    {{
      "company": "Company Name",
      "position": "Job Title",
      "period": "Start Date - End Date",
      "bullets": [
        "Accomplishment bullet 1 starting with a strong action verb",
        "Accomplishment bullet 2 highlighting impact"
      ]
    }}
  ],
  "projects": [],
  "skills": {{
    "languages": [],
    "frameworks": [],
    "tools": ["Add skills parsed from Skills.csv or text"]
  }},
  "education": [
    {{
      "institution": "University Name",
      "degree": "Degree and Major",
      "year": "Graduation Year"
    }}
  ],
  "achievements": []
}}
"""

    try:
        response = await query_ollama(prompt=prompt, system_prompt=system_prompt)
        clean_json = response.strip()
        
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[1].split("```")[0].strip()
            
        start_idx = clean_json.find("{")
        end_idx = clean_json.rfind("}")
        if start_idx != -1 and end_idx != -1:
            clean_json = clean_json[start_idx:end_idx+1]
            
        parsed_json = json.loads(clean_json)
        return parsed_json
        
    except Exception as e:
        logger.error(f"Error parsing LinkedIn ZIP data via LLM: {str(e)}. Using fallback structure.")
        return {
            "personal_info": {
                "name": "Imported LinkedIn Profile",
                "email": "candidate@email.com",
                "phone": "",
                "location": ""
            },
            "summary": "Imported LinkedIn candidate profile.",
            "experience": [],
            "projects": [],
            "skills": {
                "languages": [],
                "frameworks": [],
                "tools": []
            },
            "education": [],
            "achievements": []
        }
