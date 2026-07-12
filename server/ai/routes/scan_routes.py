from fastapi import APIRouter, UploadFile
from server.ai.services.object_detector import detect_objects
from server.ai.services.currency_detector import detect_currency

router = APIRouter()


@router.post("/detect")
async def detect(file: UploadFile):
    contents = await file.read()
    with open("temp.jpg", "wb") as f:
        f.write(contents)
    result = detect_objects("temp.jpg")
    return result


@router.post("/currency")
async def currency(file: UploadFile):
    contents = await file.read()
    with open("temp_currency.jpg", "wb") as f:
        f.write(contents)
    result = detect_currency("temp_currency.jpg")
    return result