# MediLens-360 🏥

AI-powered medical prescription analysis system with handwriting OCR, safety verification, and intelligent health assistant.

## Features
- 📄 **Smart OCR**: Extract medicines from handwritten prescriptions using Gemini Vision
- 🛡️ **Safety Checks**: Automatic allergy and drug interaction warnings
- 🤖 **AI Assistant**: Context-aware medical chatbot with RAG
- 📅 **Medicine Schedule**: Auto-generated intake timings

## Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: FastAPI, Python, SQLModel
- **Database**: SQLite
- **AI**: Google Gemini API (Flash model)

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
python -m uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to use the app.

## Project Structure
```
Research_Project/
├── backend/           # FastAPI server
│   ├── app/
│   │   ├── main.py           # API endpoints
│   │   ├── ocr_engine.py     # Gemini Vision OCR
│   │   ├── rag_engine.py     # AI chatbot logic
│   │   ├── risk_analysis.py  # Safety verification
│   │   └── database.py       # SQLite persistence
│   └── requirements.txt
├── frontend/          # Next.js app
│   └── app/
│       └── dashboard/
│           ├── prescription/  # OCR interface
│           └── assistant/     # Chatbot interface
└── README.md
```

## Research Contribution
This project demonstrates a **Hybrid AI Architecture** combining:
1. **Generative AI** (Gemini) for unstructured data (handwriting OCR)
2. **Rule-Based Logic** for deterministic safety checks (allergy/interaction warnings)
3. **RAG (Retrieval-Augmented Generation)** for context-aware medical assistance

This approach addresses the reliability concerns of pure LLM systems in healthcare applications.

## License
MIT License - See LICENSE file for details
