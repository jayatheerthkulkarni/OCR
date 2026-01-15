import time
from typing import List

import ocr_engine
import storage
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CropData(BaseModel):
    id: str | int
    text: str
    image_base64: str
    serial: int


class SaveRequest(BaseModel):
    crops: List[CropData]


@app.get("/")
def read_root():
    return {"status": "ok", "service": "OCR Backend (EasyOCR)"}


@app.post("/process-crop")
async def process_crop(file: UploadFile = File(...)):
    start = time.time()
    try:
        image_bytes = await file.read()

        # Use the optimized engine
        text = ocr_engine.perform_ocr(image_bytes)

        duration = time.time() - start
        print(
            f"Processed '{file.filename}' in {duration:.2f}s | Result: {text[:30]}..."
        )

        return {"text": text}
    except Exception as e:
        print(f"Error processing crop: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/save-batch")
async def save_batch(request: SaveRequest):
    print(f"Saving batch of {len(request.crops)} crops...")
    try:
        # Convert pydantic models to dicts
        crops_data = [crop.dict() for crop in request.crops]
        json_path = storage.save_crop_data(crops_data)

        print(f"Batch saved to: {json_path}")
        return {"status": "success", "file": json_path}
    except Exception as e:
        print(f"Error saving batch: {e}")
        raise HTTPException(status_code=500, detail=str(e))
