"""AI service using Groq SDK for document analysis and chat."""
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv('GROQ_API_KEY'))

SUPPORTED_LANGUAGES = {
    'en': 'English',
    'hi': 'हिंदी (Hindi)',
    'mr': 'मराठी (Marathi)',
    'ta': 'தமிழ் (Tamil)',
    'te': 'తెలుగు (Telugu)',
    'kn': 'ಕನ್ನಡ (Kannada)',
    'ml': 'മലയാളം (Malayalam)',
    'bn': 'বাংলা (Bengali)',
    'gu': 'ગુજરાતી (Gujarati)',
    'pa': 'ਪੰਜਾਬੀ (Punjabi)',
    'bn': 'বাংলা (Bengali)',
}


def get_system_prompt(language: str = 'en') -> str:
    """Get the system prompt in the user's preferred language."""
    prompts = {
        'en': '''You are Nyayasaathi (न्यायसाथी), an expert Indian legal assistant AI. You help users understand:
- Indian law, Constitution of India, IPC (Indian Penal Code), CrPC, Evidence Act
- Legal documents, contracts, court notices, FIRs
- Rights and remedies under Indian law

Always be helpful, accurate, and provide practical advice. When relevant, cite specific sections of Indian laws. If you're unsure, say so honestly.

Format your responses clearly using markdown. Use bullet points for clarity.''',

        'hi': '''आप Nyayasaathi (न्यायसाथी) हैं, एक विशेषज्ञ भारतीय विधिक सहायक AI। आप उपयोगकर्ताओं की सहायता करते हैं:
- भारतीय कानून, भारत का संविधान, IPC (भारतीय दंड संहिता), CrPC, साक्ष्य अधिनियम
- विधिक दस्तावेज़, अनुबंध, न्यायालय नोटिस, FIR
- भारतीय कानून के तहत अधिकार और उपचार

हमेशा सहायक, सटीक रहें और व्यावहारिक सलाह प्रदान करें। जब प्रासंगिक हो, भारतीय कानून की विशिष्ट धाराओं का उल्लेख करें। यदि आप अनिश्चित हैं, तो ईमानदारी से बताएं।

अपने उत्तर स्पष्ट रूप से प्रारूपित करें।''',
    }
    return prompts.get(language, prompts['en'])


def detect_language(text: str) -> str:
    """Simple language detection based on character patterns."""
    if any('\u0900' <= c <= '\u097F' for c in text):
        return 'hi'
    return 'en'


def analyze_document(extracted_text, language: str = 'en'):
    """Analyze a legal document and extract structured information.

    Sends the document text to Groq's llama3-70b-8192 model with a detailed
    prompt instructing it to extract document type, summary, parties, risk level,
    risky clauses, key obligations, and red flags.

    Args:
        extracted_text: The full text content of the legal document.

    Returns:
        dict: Structured analysis containing:
            - document_type (str): Type of legal document
            - summary (str): Plain English summary of the document
            - key_parties (list): List of party names involved
            - risk_level (str): Overall risk level (High/Medium/Low)
            - risks (list): List of risky clauses with details
            - key_obligations (list): List of key obligations
            - red_flags (list): List of red flag items
    """
    prompt = f"""You are an expert legal document analyst. Analyze the following legal document and provide a detailed structured analysis.

Return your response as a valid JSON object with these exact fields (no markdown, no code blocks, just plain JSON):
{{
    "document_type": "string describing the type of document",
    "summary": "string - plain English summary of the document purpose and content",
    "key_parties": ["list of main parties involved in the document"],
    "risk_level": "High or Medium or Low - overall risk assessment",
    "risks": [{{"clause": "string - clause heading or reference", "description": "string - explanation of the risk", "risk": "High/Medium/Low"}}],
    "key_obligations": ["list of key obligations mentioned in the document"],
    "red_flags": ["list of concerning items that should be reviewed carefully"]
}}

Document to analyze:
{extracted_text[:15000]}

Ensure the JSON is valid and parseable. Do not include any text outside the JSON object."""

    response = client.chat.completions.create(
        model='llama-3.3-70b-versatile',
        messages=[
            {
                'role': 'system',
                'content': 'You are a professional legal document analyzer. Always respond with valid JSON containing the exact fields specified.'
            },
            {
                'role': 'user',
                'content': prompt
            }
        ],
        temperature=0.3,
        max_tokens=4096
    )

    result_text = response.choices[0].message.content.strip()

    if result_text.startswith('```json'):
        result_text = result_text[7:]
    if result_text.startswith('```'):
        result_text = result_text[3:]
    if result_text.endswith('```'):
        result_text = result_text[:-3]

    import json
    try:
        analysis = json.loads(result_text)
    except json.JSONDecodeError:
        import re
        json_match = re.search(r'\{[\s\S]*\}', result_text)
        if json_match:
            analysis = json.loads(json_match.group())
        else:
            analysis = {
                'document_type': 'Unknown',
                'summary': result_text[:500],
                'key_parties': [],
                'risk_level': 'Medium',
                'risks': [],
                'key_obligations': [],
                'red_flags': []
            }

    return analysis


def chat_with_document(extracted_text, chat_history, user_question, language: str = 'en'):
    """Answer questions about a legal document using AI.

    Takes the full document text and chat history to provide contextual
    answers about the document content.

    Args:
        extracted_text: The full text content of the legal document.
        chat_history: List of previous chat messages as {role, content} dicts.
        user_question: The current question from the user.
        language: User's preferred language for response.

    Returns:
        str: Answer to the user's question about the document.
    """
    system_content = get_system_prompt(language)
    system_content += f"\n\nYou are helping the user understand a legal document. Use the document content provided to answer their questions accurately. If you don't find specific information in the document, say so clearly.\n\nDocument content:\n{extracted_text[:20000]}"

    messages = [{'role': 'system', 'content': system_content}]

    for msg in chat_history:
        messages.append({
            'role': msg.get('role', 'user'),
            'content': msg.get('content', '')
        })

    messages.append({
        'role': 'user',
        'content': user_question
    })

    response = client.chat.completions.create(
        model='llama-3.3-70b-versatile',
        messages=messages,
        temperature=0.5,
        max_tokens=2048
    )

    return response.choices[0].message.content.strip()


def general_chat(user_message: str, chat_history: list, language: str = 'en'):
    """Handle general legal questions without a specific document.

    Args:
        user_message: The user's question.
        chat_history: List of previous chat messages.
        language: User's preferred language for response.

    Returns:
        str: AI response to the legal question.
    """
    system_content = get_system_prompt(language)
    system_content += "\n\nYou are answering a general legal question about Indian law. Provide accurate, helpful information and cite relevant sections when possible. If the question requires consultation with a lawyer, suggest that appropriately."

    messages = [{'role': 'system', 'content': system_content}]

    for msg in chat_history:
        messages.append({
            'role': msg.get('role', 'user'),
            'content': msg.get('content', '')
        })

    messages.append({
        'role': 'user',
        'content': user_message
    })

    response = client.chat.completions.create(
        model='llama-3.3-70b-versatile',
        messages=messages,
        temperature=0.7,
        max_tokens=2048
    )

    return response.choices[0].message.content.strip()