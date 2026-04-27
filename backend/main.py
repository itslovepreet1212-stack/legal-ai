"""FastAPI main application for Nyayasaathi - Indian Legal AI Assistant."""
import os
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

from services import extract_text, analyze_document, chat_with_document, general_chat, get_nearby_lawyers, extract_text_from_image, detect_language, SUPPORTED_LANGUAGES

app = FastAPI(
    title='Nyayasaathi - Indian Legal AI',
    description='AI-powered legal assistant for Indian Constitution and Law',
    version='2.0.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

document_store: Dict[str, str] = {}
analysis_store: Dict[str, Dict[str, Any]] = {}
user_history: List[Dict[str, Any]] = []
user_preferences: Dict[str, Any] = {'language': 'en', 'name': 'User'}


class ChatRequest(BaseModel):
    filename: str
    chat_history: List[Dict[str, str]]
    question: str
    language: Optional[str] = 'en'


class GeneralChatRequest(BaseModel):
    message: str
    chat_history: List[Dict[str, str]]
    language: Optional[str] = 'en'


class PreferencesRequest(BaseModel):
    language: Optional[str] = None
    name: Optional[str] = None


@app.get('/')
async def root():
    return {
        'status': 'ok',
        'name': 'Nyayasaathi (न्यायसाथी)',
        'tagline': 'Your Justice Companion',
        'version': '2.0.0',
        'languages': SUPPORTED_LANGUAGES
    }


@app.get('/languages')
async def get_languages():
    return {'languages': SUPPORTED_LANGUAGES}


@app.post('/upload')
async def upload_document(file: UploadFile = File(...), language: str = 'en'):
    if file.filename is None:
        raise HTTPException(status_code=400, detail='No filename provided')

    extension = file.filename.lower().split('.')[-1]
    if extension not in ('pdf', 'docx', 'doc'):
        raise HTTPException(
            status_code=400,
            detail='Unsupported file type. Please upload a PDF or DOCX file.'
        )

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{extension}') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name

        extracted_text = extract_text(tmp_file_path, file.filename)
        os.unlink(tmp_file_path)

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail='Could not extract text from the document. The file may be empty or image-based.')

        document_store[file.filename] = extracted_text

        analysis = analyze_document(extracted_text, language)
        analysis_store[file.filename] = analysis

        history_entry = {
            'id': len(user_history) + 1,
            'filename': file.filename,
            'type': 'document',
            'timestamp': datetime.now().isoformat(),
            'document_type': analysis.get('document_type', 'Unknown'),
            'risk_level': analysis.get('risk_level', 'Medium'),
            'summary': analysis.get('summary', '')[:200]
        }
        user_history.insert(0, history_entry)

        return {
            'filename': file.filename,
            'status': 'success',
            'analysis': analysis
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error processing document: {str(e)}')


@app.post('/upload-image')
async def upload_image(file: UploadFile = File(...), language: str = 'en'):
    if file.filename is None:
        raise HTTPException(status_code=400, detail='No filename provided')

    extension = file.filename.lower().split('.')[-1]
    if extension not in ('jpg', 'jpeg', 'png', 'webp', 'bmp'):
        raise HTTPException(
            status_code=400,
            detail='Unsupported image type. Please upload JPG, PNG, WEBP, or BMP.'
        )

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{extension}') as tmp_file:
            content = await file.read()
            if len(content) > 10 * 1024 * 1024:
                raise HTTPException(status_code=400, detail='Image size must be less than 10MB.')
            tmp_file.write(content)
            tmp_file_path = tmp_file.name

        extracted_text = extract_text_from_image(tmp_file_path, file.filename)
        os.unlink(tmp_file_path)

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail='Could not extract text from the image. Please ensure the image is clear and readable.')

        temp_filename = f"image_{datetime.now().timestamp()}_{file.filename}"
        document_store[temp_filename] = extracted_text

        analysis = analyze_document(extracted_text, language)
        analysis_store[temp_filename] = analysis

        history_entry = {
            'id': len(user_history) + 1,
            'filename': file.filename,
            'type': 'image',
            'timestamp': datetime.now().isoformat(),
            'document_type': analysis.get('document_type', 'Unknown'),
            'risk_level': analysis.get('risk_level', 'Medium'),
            'summary': analysis.get('summary', '')[:200]
        }
        user_history.insert(0, history_entry)

        return {
            'filename': temp_filename,
            'original_filename': file.filename,
            'status': 'success',
            'analysis': analysis
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error processing image: {str(e)}')


@app.post('/chat')
async def chat(request: ChatRequest):
    if request.filename not in document_store:
        raise HTTPException(status_code=404, detail='Document not found. Please upload the document first.')

    try:
        extracted_text = document_store[request.filename]
        answer = chat_with_document(extracted_text, request.chat_history, request.question, request.language)

        return {
            'status': 'success',
            'answer': answer
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error generating response: {str(e)}')


@app.post('/general-chat')
async def general_chat_endpoint(request: GeneralChatRequest):
    try:
        answer = general_chat(request.message, request.chat_history, request.language)

        return {
            'status': 'success',
            'answer': answer
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error generating response: {str(e)}')


@app.get('/lawyers')
async def lawyers(
    filename: str = Query(..., description='The filename of the uploaded document'),
    latitude: float = Query(..., description='Latitude of the search location'),
    longitude: float = Query(..., description='Longitude of the search location')
):
    if filename not in analysis_store:
        raise HTTPException(status_code=404, detail='Document analysis not found. Please upload the document first.')

    try:
        document_type = analysis_store[filename].get('document_type', 'lawyer')
        lawyers_list = get_nearby_lawyers(document_type, latitude, longitude)

        return lawyers_list

    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error finding lawyers: {str(e)}')


@app.get('/user/history')
async def get_user_history(limit: int = Query(10, ge=1, le=50)):
    return {
        'history': user_history[:limit],
        'total': len(user_history)
    }


@app.post('/user/history/{history_id}')
async def delete_history_entry(history_id: int):
    global user_history
    user_history = [h for h in user_history if h['id'] != history_id]
    return {'status': 'success', 'message': 'Entry deleted'}


@app.get('/user/preferences')
async def get_preferences():
    return user_preferences


@app.post('/user/preferences')
async def update_preferences(request: PreferencesRequest):
    global user_preferences
    if request.language:
        user_preferences['language'] = request.language
    if request.name:
        user_preferences['name'] = request.name
    return {'status': 'success', 'preferences': user_preferences}


@app.post('/detect-language')
async def detect_text_language(text: str = Query(..., min_length=3)):
    lang = detect_language(text)
    return {'detected_language': lang, 'language_name': SUPPORTED_LANGUAGES.get(lang, 'English')}


@app.get('/health')
async def health_check():
    return {
        'status': 'healthy',
        'documents_stored': len(document_store),
        'analysis_stored': len(analysis_store),
        'history_entries': len(user_history)
    }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)