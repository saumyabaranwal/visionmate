from fastapi import FastAPI , Request , UploadFile , File
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/")
async def scan(image: UploadFile = File(...)):

    contents = await image.read()

    with open(f"uploads/{image.filename}", "wb") as f:
       f.write(contents)

    return {
    "success": True
    }

    
   