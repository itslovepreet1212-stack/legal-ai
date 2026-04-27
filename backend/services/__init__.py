"""Services package for Legal AI application."""
from .document_parser import extract_text
from .ai_service import analyze_document, chat_with_document, general_chat, detect_language, SUPPORTED_LANGUAGES
from .places_service import get_nearby_lawyers
from .image_service import extract_text_from_image

__all__ = [
    'extract_text',
    'analyze_document',
    'chat_with_document',
    'general_chat',
    'detect_language',
    'SUPPORTED_LANGUAGES',
    'get_nearby_lawyers',
    'extract_text_from_image'
]