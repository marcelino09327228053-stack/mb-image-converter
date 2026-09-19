"""Standalone MB Image Converter file-converter application."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse, HTMLResponse

from app.api.file_converter import router as file_converter_router

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="MB Image Converter", description="Private, in-memory file converter")
app.include_router(file_converter_router)


@app.get("/")
@app.get("/convert")
async def converter_page():
    html = (BASE_DIR / "converter.html").read_text(encoding="utf-8")
    tab_css = """<style>
.resume-tab{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;color:#194d3b;border:1px solid rgba(25,77,59,.28);background:#fffdf8;border-radius:999px;padding:10px 15px;font-size:13px;font-weight:850;white-space:nowrap;transition:.2s}.resume-tab:hover{background:#194d3b;color:white;transform:translateY(-1px)}.nav-actions{display:flex;align-items:center;gap:14px}@media(max-width:620px){.safe{display:none!important}.resume-tab{font-size:11px;padding:9px 11px}.nav-actions{gap:6px}}
</style>"""
    html = html.replace("</head>", tab_css + "</head>", 1)
    html = html.replace(
        '<div class="safe">Pribado at walang sine-save na file</div></nav>',
        '<div class="nav-actions"><a class="resume-tab" href="/resume">Create Your Resume</a><div class="safe">Pribado at walang sine-save na file</div></div></nav>',
        1,
    )
    return HTMLResponse(html)


@app.get("/resume")
async def resume_page():
    return FileResponse(BASE_DIR / "resume.html")


@app.get("/health")
async def health():
    return {"status": "ok"}
