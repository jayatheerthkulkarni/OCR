import base64
import json
import os
import uuid
from typing import Dict, List

OUTPUT_DIR = "output"
MAIN_JSON_PATH = os.path.join(OUTPUT_DIR, "main.json")


def ensure_output_dir():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)


def save_crop_data(crops: List[Dict]):
    """
    crops: List of dicts with keys: 'text', 'image_base64', 'serial'
    """
    ensure_output_dir()

    saved_records = []

    for crop in crops:
        try:
            # Handle data:image/png;base64, prefix
            b64_str = crop["image_base64"]
            if "," in b64_str:
                b64_str = b64_str.split(",")[1]

            image_data = base64.b64decode(b64_str)

            # Generate filename: serial_uuid.png to prevent overwrites
            unique_id = str(uuid.uuid4())[:8]
            filename = f"crop_{crop['serial']}_{unique_id}.png"
            file_path = os.path.join(OUTPUT_DIR, filename)

            # RvSave image
            with open(file_path, "wb") as f:
                f.write(image_data)

            # Use absolute path
            abs_path = os.path.abspath(file_path)

            saved_records.append(
                {
                    "serial": crop["serial"],
                    "text_data": crop["text"],
                    "image_file_path": abs_path,
                    "id": crop.get("id", unique_id),
                }
            )
        except Exception as e:
            print(f"Error saving crop {crop.get('serial')}: {e}")

    # Overwrite main.json with the latest batch
    with open(MAIN_JSON_PATH, "w") as f:
        json.dump(saved_records, f, indent=4)

    return MAIN_JSON_PATH
