"""Document text extraction service using PyMuPDF and python-docx."""
import fitz
import docx


def extract_text_from_pdf(file_path):
    """Extract text content from a PDF file using PyMuPDF (fitz).

    Args:
        file_path: Path to the PDF file to extract text from.

    Returns:
        str: Extracted text content from all pages of the PDF.
    """
    document = fitz.open(file_path)
    text_parts = []

    for page_num in range(len(document)):
        page = document[page_num]
        text_parts.append(page.get_text())

    document.close()
    return '\n'.join(text_parts)


def extract_text_from_docx(file_path):
    """Extract text content from a DOCX file using python-docx.

    Args:
        file_path: Path to the DOCX file to extract text from.

    Returns:
        str: Extracted text content from all paragraphs in the document.
    """
    doc = docx.Document(file_path)
    paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
    return '\n'.join(paragraphs)


def extract_text(file_path, filename):
    """Extract text from a document based on file extension.

    Detects whether the file is PDF or DOCX based on the filename extension
    and calls the appropriate extraction function.

    Args:
        file_path: Path to the document file.
        filename: Name of the file (used to detect extension).

    Returns:
        str: Extracted text content from the document.

    Raises:
        ValueError: If the file type is not supported.
    """
    extension = filename.lower().split('.')[-1]

    if extension == 'pdf':
        return extract_text_from_pdf(file_path)
    elif extension in ('docx', 'doc'):
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f'Unsupported file type: .{extension}. Please upload a PDF or DOCX file.')