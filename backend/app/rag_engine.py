"""
RAG Engine for MediLens-360 Medical Assistant
Uses Google Gemini to answer questions based on patient context.
"""

from typing import Optional, List, Dict
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Initialize Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

SYSTEM_PROMPT_TEMPLATE = """
You are MediLens-360, an intelligent medical assistant.
Your goal is to help patients understand their prescriptions and manage their health.

PATIENT CONTEXT:
Measurements/Profile: {profile_str}
Current Medications:
{medications_str}

GUIDELINES:
1. Be concise, empathetic, and helpful.
2. **Dietary & Lifestyle suggestions**: For common ailments (flu, cold, fever, minor aches), you are ENCOURAGED to suggest beneficial foods, hydration, and rest.
    - Phrasing: Use "It is often helpful to...", "You might consider...", "Common home remedies include...".
    - avoid "prescribing" food as if it's a drug.
3. **Medical Safety**: Do NOT independently diagnose specific diseases or prescribe medications.
4. **Disclaimer**: ALWAYS end your response with a short disclaimer: "Consult a doctor for professional medical advice."
5. If the user asks about a specific medicine, check their "Current Medications" list first.
6. Food Interactions: Always mention if a medicine needs to be taken with/without food if known.

Respond in markdown format.
"""

async def generate_response(
    message: str, 
    history: List[Dict[str, str]], 
    patient_profile: Optional[dict] = None, 
    medicines: Optional[List[dict]] = None
) -> str:
    """
    Generate a response using Gemini with full context.
    """
    if not GOOGLE_API_KEY:
        return "⚠️ Google API Key is missing. Please add GOOGLE_API_KEY to your .env file."

    try:
        # Format context for system prompt
        profile_str = "Unknown"
        if patient_profile:
            # Convert dict to readable string, filtering empty values
            profile_str = ", ".join([f"{k}: {v}" for k, v in patient_profile.items() if v])
        
        medications_str = "None identified."
        if medicines:
            med_lines = []
            for m in medicines:
                name = m.get("name", "Unknown")
                dosage = m.get("dosage", "")
                freq = m.get("frequency", "")
                med_lines.append(f"- {name} ({dosage}) - {freq}")
            medications_str = "\n".join(med_lines)

        system_instruction = SYSTEM_PROMPT_TEMPLATE.format(
            profile_str=profile_str,
            medications_str=medications_str
        )

        # Configure Model with System Instruction
        model = genai.GenerativeModel(
            model_name="gemini-flash-latest",
            system_instruction=system_instruction
        )

        # Build message history for Gemini
        # Gemini expects: [{'role': 'user', 'parts': [...]}, {'role': 'model', 'parts': [...]}]
        chat_history = []
        for msg in history[-10:]: # Gemini has larger context, we can take more
            role = "user" if msg.get("role") == "user" else "model"
            content = msg.get("content", "")
            if content:
                chat_history.append({"role": role, "parts": [content]})

        # Start chat session
        chat = model.start_chat(history=chat_history)
        
        # Send new message
        response = await chat.send_message_async(message)
        
        if response.usage_metadata:
            print(f"\n[Token Usage] Input: {response.usage_metadata.prompt_token_count}, Output: {response.usage_metadata.candidates_token_count}, Total: {response.usage_metadata.total_token_count}")
        
        return response.text

    except Exception as e:
        return f"Error connecting to AI service: {str(e)}"
