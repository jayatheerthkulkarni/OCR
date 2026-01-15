import base64
import io
import logging
import time

import ollama

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("OCR-LLM")

# Configuration
OLLAMA_MODEL = (
    "qwen2.5vl:7b"
)


class OCREngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(OCREngine, cls).__new__(cls)
            cls._instance._warmup()
        return cls._instance

    def _warmup(self):
        """Checks if Ollama is reachable and model is loaded."""
        try:
            logger.info(f"Connecting to Ollama ({OLLAMA_MODEL})...")
            # Simple check to see if model is available, pulls if not (might take time)
            ollama.show(OLLAMA_MODEL)
            logger.info("Ollama connection successful.")
        except Exception as e:
            logger.critical(f"Ollama Error: Is Ollama running? {e}")

    def process_image(self, image_bytes: bytes) -> str:
        """
        Sends image to Ollama for OCR.
        """
        try:
            start_time = time.time()

            # Ollama Python client expects a list of byte objects or paths
            # We already have bytes, so we can pass them directly.

            response = ollama.chat(
                model=OLLAMA_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": "The image is a doctor's handwriting(If the image is unclear print the closest medicine/word that makes sense). Output ONLY the text, no conversational filler.",
                        "images": [image_bytes],
                    }
                ],
            )

            text = response["message"]["content"].strip()

            duration = time.time() - start_time
            logger.info(f"LLM OCR finished in {duration:.2f}s")

            return text

        except Exception as e:
            logger.error(f"LLM Inference Failed: {e}")
            return "Error: Could not extract text via Ollama."


# Global instance
engine = OCREngine()


def perform_ocr(image_bytes: bytes) -> str:
    return engine.process_image(image_bytes)
