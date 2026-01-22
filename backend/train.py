import os

import pandas as pd
import torch
from PIL import Image
from transformers import TrOCRProcessor, VisionEncoderDecoderModel

# 1. HARDWARE CHECK
# If this says CPU, go make a coffee. A long one.
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(
    f"The Oracle is running on: {torch.cuda.get_caption_image_name(0) if torch.cuda.is_available() else 'CPU (Painful)'}"
)

# 2. CONFIGURATION
# Path to the model we just trained (hopefully it learned something)
MODEL_PATH = "./fine_tuned_doctor_model"
# Folder containing the fresh batch of doctor scribbles
IMAGE_FOLDER = "images_to_predict/"
# Where we dump the AI's guesses so you can grade its homework
OUTPUT_CSV = "predictions_to_correct.csv"


def load_the_beast():
    print("Waking up the model...")
    try:
        processor = TrOCRProcessor.from_pretrained(MODEL_PATH)
        model = VisionEncoderDecoderModel.from_pretrained(MODEL_PATH)
        model.to(device)
        return processor, model
    except OSError:
        print(
            "Error: Model not found! Did you run the training script? Or did the 3070 catch fire?"
        )
        exit()


def read_scribbles(processor, model, image_path):
    try:
        image = Image.open(image_path).convert("RGB")
    except:
        print(
            f"Corrupted image: {image_path}. Probably spilled coffee on the scanner."
        )
        return "ERROR_OPENING_IMAGE"

    # Preprocess: turning pixels into math
    pixel_values = processor(image, return_tensors="pt").pixel_values.to(device)

    # Generate: The AI is thinking...
    generated_ids = model.generate(pixel_values, max_length=64)

    # Decode: Turning math back into words
    generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
    return generated_text


def main():
    processor, model = load_the_beast()

    # Get all images. We ignore hidden files because we are professionals.
    images = [f for f in os.listdir(IMAGE_FOLDER) if not f.startswith(".")]

    if not images:
        print(f"No images found in {IMAGE_FOLDER}. Feed me data!")
        return

    results = []
    print(f"Launching inference on {len(images)} images...")

    for filename in images:
        image_path = os.path.join(IMAGE_FOLDER, filename)

        prediction = read_scribbles(processor, model, image_path)

        print(f"{filename} -> {prediction}")
        results.append({"filename": filename, "prediction": prediction})

    # Save to CSV so you can fix the AI's mistakes
    df = pd.DataFrame(results)
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"\nDone. Predictions saved to {OUTPUT_CSV}.")
    print(
        "Now open that CSV, fix the typos, add it to your training data, and run train_ocr.py again."
    )
    print("   The cycle continues.")


if __name__ == "__main__":
    main()
