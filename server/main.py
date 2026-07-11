from fastapi import FastAPI , Request
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def get():
    return {
        "message": "Backend working"
    }

@app.post("/")
async def post(request: Request):

    data = await request.json()

    return {
        "message": f'hello {data["name"]}'
    }