# Legal AI - Document Analyzer

AI-powered legal document analysis with chatbot and lawyer finder.

## Features

- Upload PDF or DOCX legal documents
- AI-powered document analysis (type, summary, risks, obligations, red flags)
- Real-time chatbot for document questions
- Comprehensive legal document processing

## Tech Stack

- **Backend**: Python, FastAPI, Groq SDK (llama3-70b-8192)
- **Frontend**: React.js, Vite, Tailwind CSS, React Router

## Setup Instructions

### Backend Setup

1. Navigate to the backend folder:
```bash
cd legal-ai/backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the `backend/` directory with your API keys:
```
GROQ_API_KEY=your-groq-key-here
```

4. Run the backend server:
```bash
uvicorn main:app --reload
```
The backend will run on http://localhost:8000

### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd legal-ai/frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Run the frontend development server:
```bash
npm run dev
```
The frontend will run on http://localhost:5173

## API Keys Required

### Groq API Key
1. Sign up at https://console.groq.com
2. Create a new API key
3. Add it to your backend `.env` as `GROQ_API_KEY`

## Usage

1. Start the backend server on port 8000
2. Start the frontend server on port 5173
3. Open http://localhost:5173 in your browser
4. Upload a PDF or DOCX legal document
5. View the AI analysis of your document
6. Chat with the AI assistant about your document

## Project Structure

```
legal-ai/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── .env                 # Environment variables
│   ├── requirements.txt     # Python dependencies
│   └── services/
│       ├── document_parser.py  # PDF/DOCX text extraction
│       ├── ai_service.py       # Groq AI integration
│       └── image_service.py    # Image processing
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── pages/
│       │   ├── Upload.jsx
│       │   ├── Analysis.jsx
│       │   ├── Chat.jsx
│       │   ├── Dashboard.jsx
│       │   └── Profile.jsx
│       └── components/
│           ├── Chatbot.jsx
│           └── RiskBadge.jsx
└── README.md
```
