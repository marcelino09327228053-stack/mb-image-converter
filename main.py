"""Standalone MB Image Converter file-converter application."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse

from app.api.file_converter import router as file_converter_router

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="MB Image Converter", description="Private, in-memory file converter")
app.include_router(file_converter_router)


@app.get("/")
@app.get("/convert")
async def converter_page():
    return FileResponse(BASE_DIR / "converter.html")


@app.get("/resume")
@app.get("/resume/")
async def resume_page():
    return FileResponse(BASE_DIR / "resume.html")


@app.get("/health")
async def health():
    return {"status": "ok"}
