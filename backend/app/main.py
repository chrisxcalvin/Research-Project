from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlmodel import Session, select
from contextlib import asynccontextmanager

from app.ocr_engine import extract_text_from_image, parse_prescription_text
from app.risk_analysis import analyze_risks, generate_schedule
from app.rag_engine import generate_response
from app.database import create_db_and_tables, get_session
from app.models import ChatSession, ChatMessage

# Lifecycle manager to create DB on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="MediLens-360 API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class Medicine(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None # Added frequency support from Gemini OCR

class PatientProfile(BaseModel):
    name: Optional[str] = None
    age: Optional[str] = None
    allergies: List[str] = []
    conditions: List[str] = []

class RiskAnalysisRequest(BaseModel):
    medicines: List[Medicine]
    patient_profile: PatientProfile

@app.get("/")
def read_root():
    return {"message": "MediLens-360 Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/analyze_prescription")
async def analyze_prescription(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        contents = await file.read()
        text = extract_text_from_image(contents)
        result = parse_prescription_text(text)
        
        if not result.get("is_prescription", False):
             raise HTTPException(status_code=400, detail=result.get("validation_message", "Image is not a valid prescription."))
             
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze_risks")
async def analyze_risks_endpoint(request: RiskAnalysisRequest):
    """
    Analyze medicines against patient profile for potential risks.
    """
    try:
        medicines_dict = [med.model_dump() for med in request.medicines]
        profile_dict = request.patient_profile.model_dump()
        
        risk_result = analyze_risks(medicines_dict, profile_dict)
        schedule = generate_schedule(medicines_dict)
        
        return {
            "risk_analysis": risk_result,
            "schedule": schedule
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_schedule")
async def generate_schedule_endpoint(medicines: List[Medicine]):
    """
    Generate a medicine intake schedule.
    """
    try:
        medicines_dict = [med.model_dump() for med in medicines]
        schedule = generate_schedule(medicines_dict)
        return {"schedule": schedule}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Chat Models
class ChatMessageGeneric(BaseModel):
    role: str
    content: str
    
class ChatRequest(BaseModel):
    message: str
    # History is optional, we can fetch from DB if session_id is provided
    history: List[ChatMessageGeneric] = [] 
    patient_profile: Optional[PatientProfile] = None
    medicines: List[Medicine] = []
    session_id: Optional[str] = None

@app.post("/chat")
async def chat_endpoint(request: ChatRequest, session: Session = Depends(get_session)):
    """
    Chat with the medical assistant.
    Persists chat history to SQLite database.
    """
    try:
        # Manage Session
        chat_session = None
        if request.session_id:
            chat_session = session.get(ChatSession, request.session_id)
        
        if not chat_session:
            # Create new session if missing or not found
            chat_session = ChatSession(patient_identifier=request.patient_profile.name if request.patient_profile else "Anonymous")
            session.add(chat_session)
            session.commit()
            session.refresh(chat_session)

        # Save User Message
        user_msg = ChatMessage(session_id=chat_session.id, role="user", content=request.message)
        session.add(user_msg)
        session.commit()
        
        # Prepare context
        # 1. Get history from DB (or use provided history as fallback)
        statement = select(ChatMessage).where(ChatMessage.session_id == chat_session.id).order_by(ChatMessage.timestamp)
        db_messages = session.exec(statement).all()
        
        history_dicts = [{"role": m.role, "content": m.content} for m in db_messages]
        
        # 2. Convert Pydantic models to dicts
        profile_dict = request.patient_profile.model_dump() if request.patient_profile else None
        medicines_dicts = [med.model_dump() for med in request.medicines]
        
        # Generate Response
        response_text = await generate_response(
            message=request.message,
            history=history_dicts,
            patient_profile=profile_dict,
            medicines=medicines_dicts
        )
        
        # Save Assistant Message
        bot_msg = ChatMessage(session_id=chat_session.id, role="assistant", content=response_text)
        session.add(bot_msg)
        session.commit()
        
        return {
            "response": response_text,
            "session_id": chat_session.id,
            "sources": ["MediLens-360 AI"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str, session: Session = Depends(get_session)):
    """
    Retrieve chat history for a session.
    """
    messages = session.exec(select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp)).all()
    return messages
