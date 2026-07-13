from fastapi import FastAPI , UploadFile , File
from fastapi.middleware.cors import CORSMiddleware
import os
from ai.services.object_detector import detect_objects
from ai.services.currency_detector import detect_currency




app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


os.makedirs("uploads", exist_ok=True)


async def save_image(image: UploadFile):
    contents = await image.read()

    path = f"uploads/{image.filename}"

    with open(path, "wb") as f:
        f.write(contents)

    return path




@app.post("/api/read-text")
async def read_text(image: UploadFile = File(...)):
    path = await save_image(image)

    

    return {
        "success": True,
        "text": "hello"
    }


@app.post("/api/object-detection")
async def object_detection(image: UploadFile = File(...)):
    path = await save_image(image)

    result = detect_objects(path)

    return result

   


@app.post("/api/currency-detection")
async def currency_detection(image: UploadFile = File(...)):
    path = await save_image(image)

    result = detect_currency(path)

    return result

    
   


@app.post("/api/surroundings")
async def surroundings(image: UploadFile = File(...)):
    path = await save_image(image)


    return {
        "success": True,
        "description": "tree"
    }