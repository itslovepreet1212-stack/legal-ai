"""Image processing service for OCR and document extraction."""

import io
import os

import pytesseract
from PIL import Image

SUPPORTED_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "bmp"]
MAX_IMAGE_SIZE = 10 * 1024 * 1024


def extract_text_from_image(image_path: str, filename: str) -> str:
    """Extract text from an image using Tesseract OCR.

    Args:
        image_path: Path to the image file.
        filename: Original filename for language detection.

    Returns:
        str: Extracted text from the image.

    Raises:
        ValueError: If image cannot be processed.
    """
    try:
        image = Image.open(image_path)

        if image.mode not in ("RGB", "L", "RGBA"):
            image = image.convert("RGB")

        extracted_text = pytesseract.image_to_string(image, lang="eng+hin")

        if not extracted_text.strip():
            extracted_text = pytesseract.image_to_string(image)

        return extracted_text.strip()

    except Exception as e:
        raise ValueError(f"Failed to extract text from image: {str(e)}")


def validate_image(file_path: str) -> bool:
    """Validate that file is a valid image."""
    try:
        img = Image.open(file_path)
        img.verify()
        return True
    except Exception:
        return False
