from fastapi import FastAPI
from routes.scan_routes import router as scan_router

app = FastAPI()
app.include_router(scan_router)