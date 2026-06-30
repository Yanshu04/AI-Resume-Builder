from app.models.chat_session import ChatSession
from app.utils.ollama_client import query_ollama
import json

# List of steps in sequence
STEPS = ["profession", "experience", "project", "skills", "education", "achievements", "complete"]

STEP_DESCRIPTIONS = {
    "profession": "professional role or job title targeting",
    "experience": "years of experience, job responsibilities, and primary roles",
    "project": "most significant project, its purpose, tech stack, and your contributions",
    "skills": "core technical skills, libraries, frameworks, databases, and languages",
    "education": "university degrees, majors, school names, and graduation years",
    "achievements": "professional achievements, quantifiable metrics, or awards",
    "complete": "complete state where all answers have been gathered"
}

INITIAL_PROMPT = "Welcome! Let's build your professional resume. What professional role or job title are you targeting?"

async def handle_chat_turn(session: ChatSession, user_message: str) -> tuple[str, str, bool]:
    """
    Process one turn in the chat.
    Updates the session answers, transitions to the next step,
    and returns: (ai_reply, next_step, is_complete).
    """
    current_step = session.current_step
    answers = dict(session.answers) if session.answers else {}

    # If already complete, do not process further
    if current_step == "complete":
        return "Your chat interview is already complete! You can generate your resume now.", "complete", True

    # 1. Store the user's answer for the current step
    answers[current_step] = user_message
    session.answers = answers

    # 2. Get the index of the current step and transition to the next step
    curr_idx = STEPS.index(current_step)
    next_step = STEPS[curr_idx + 1]
    session.current_step = next_step

    # 3. Check if we've completed the flow
    if next_step == "complete":
        ai_reply = "Thank you! I have gathered all the necessary details. I am now ready to compile your professional resume. Click the 'Generate Resume' button below to view the draft."
        return ai_reply, "complete", True

    # 4. Generate the next question using Ollama
    next_desc = STEP_DESCRIPTIONS[next_step]
    
    system_prompt = (
        "You are an expert recruiter and professional resume writer interviewing a candidate.\n"
        "Acknowledge the candidate's response briefly and ask a direct, natural question to gather information for the next section.\n"
        "Keep your response natural, short (1-2 sentences), and highly professional. Do not use lists or headers."
    )
    
    prompt = (
        f"Prior Interview Details Gathered So Far:\n{json.dumps(answers, indent=2)}\n\n"
        f"Just Answered section: '{current_step}' with details: '{user_message}'\n\n"
        f"Next section to collect: '{next_step}' (which covers: {next_desc})\n\n"
        f"Write a reply that briefly acknowledges the details of '{current_step}' and then asks a follow-up question to collect the candidate's info for '{next_step}'."
    )

    try:
        ai_reply = await query_ollama(prompt=prompt, system_prompt=system_prompt)
        # Clean up any potential markdown artefacts
        ai_reply = ai_reply.strip('"').strip("'")
    except Exception as e:
        # Fallback question if Ollama fails or times out
        fallbacks = {
            "experience": "Understood. How many years of experience do you have in this field, and what are your primary responsibilities?",
            "project": "Excellent. Could you describe the most significant project you worked on, including its tech stack and your contributions?",
            "skills": "Great. What are the key technical skills, languages, frameworks, or tools you are most proficient in?",
            "education": "Got it. Could you tell me about your educational background (degree, major, university, and graduation year)?",
            "achievements": "Perfect. What are 1 or 2 key professional achievements, certifications, or metrics you are most proud of?"
        }
        ai_reply = f"Acknowledged. {fallbacks.get(next_step, 'Could you tell me more about ' + next_desc + '?')}"

    return ai_reply, next_step, False
