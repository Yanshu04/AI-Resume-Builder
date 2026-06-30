from app.utils.ollama_client import query_ollama

async def generate_summary(role: str, key_skills: str = "") -> str:
    """
    Generates a professional resume summary for a target role using Ollama.
    """
    system_prompt = (
        "You are an expert resume writer. Write a highly professional, polished resume summary.\n"
        "Output ONLY the summary text, no quotes, no intros, no conversational fillers."
    )
    
    prompt = (
        f"Target Role: {role}\n"
        f"Key Skills/Details: {key_skills}\n\n"
        "Instructions:\n"
        "- Write a single, high-impact paragraph (3 sentences max).\n"
        "- Start with a strong professional adjective or description (e.g., 'Results-oriented Software Engineer with...').\n"
        "- Highlight key technical competencies and value add.\n"
        "Generate the summary now:"
    )
    
    response = await query_ollama(prompt=prompt, system_prompt=system_prompt)
    return response.strip('"').strip("'").strip()
