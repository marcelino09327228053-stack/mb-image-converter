"""In-memory file conversion helpers used by the public converter."""

from __future__ import annotations

import io
import zipfile
from dataclasses import dataclass
from pathlib import Path

import fitz
from docx import Document
from fpdf import FPDF
from PIL import Image, ImageOps


MAX_FILE_SIZE = 100 * 1024 * 1024
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff", ".gif"}
ALLOWED_TARGETS = {"pdf", "jpg", "png", "webp", "bmp", "tiff", "gif"}


@dataclass
class ConvertedFile:
    data: bytes
    filename: str
    media_type: str


def available_targets(filename: str) -> list[str]:
    ext = Path(filename).suffix.lower()
    if ext in IMAGE_EXTENSIONS:
        return ["pdf", "jpg", "png", "webp", "bmp", "tiff", "gif"]
    if ext == ".pdf":
        return ["jpg", "png"]
    if ext in {".txt", ".docx"}:
        return ["pdf"]
    return []


def convert_file(data: bytes, filename: str, target: str) -> ConvertedFile:
    target = target.lower().lstrip(".")
    ext = Path(filename).suffix.lower()
    stem = Path(filename).stem or "converted"
    if target not in ALLOWED_TARGETS or target not in available_targets(filename):
        raise ValueError("Hindi suportado ang napiling conversion para sa file na ito.")
    if ext in IMAGE_EXTENSIONS:
        return _convert_image(data, stem, target)
    if ext == ".pdf":
        return _convert_pdf(data, stem, target)
    if ext in {".txt", ".docx"}:
        text = _extract_text(data, ext)
        return _text_to_pdf(text, stem)
    raise ValueError("Hindi suportado ang file type na ito.")


def _open_image(data: bytes) -> Image.Image:
    image = Image.open(io.BytesIO(data))
    image.load()
    return ImageOps.exif_transpose(image)


def _flatten_rgb(image: Image.Image) -> Image.Image:
    if image.mode in {"RGBA", "LA"} or "transparency" in image.info:
        rgba = image.convert("RGBA")
        background = Image.new("RGB", rgba.size, "white")
        background.paste(rgba, mask=rgba.getchannel("A"))
        return background
    return image.convert("RGB")


def _convert_image(data: bytes, stem: str, target: str) -> ConvertedFile:
    image = _open_image(data)
    output = io.BytesIO()
    if target == "pdf":
        _flatten_rgb(image).save(output, "PDF", resolution=150)
        return ConvertedFile(output.getvalue(), f"{stem}.pdf", "application/pdf")
    formats = {
        "jpg": ("JPEG", "image/jpeg"),
        "png": ("PNG", "image/png"),
        "webp": ("WEBP", "image/webp"),
        "bmp": ("BMP", "image/bmp"),
        "tiff": ("TIFF", "image/tiff"),
        "gif": ("GIF", "image/gif"),
    }
    fmt, media_type = formats[target]
    if target in {"jpg", "bmp"}:
        converted = _flatten_rgb(image)
    elif target == "gif":
        converted = _flatten_rgb(image).convert("P", palette=Image.Palette.ADAPTIVE)
    else:
        converted = image
    converted.save(output, fmt, quality=92, optimize=True)
    return ConvertedFile(output.getvalue(), f"{stem}.{target}", media_type)


def _convert_pdf(data: bytes, stem: str, target: str) -> ConvertedFile:
    document = fitz.open(stream=data, filetype="pdf")
    if document.page_count == 0:
        raise ValueError("Walang page ang PDF na ito.")
    rendered: list[tuple[str, bytes]] = []
    for page_number, page in enumerate(document, start=1):
        pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        fmt = "jpeg" if target == "jpg" else "png"
        rendered.append((f"{stem}-page-{page_number}.{target}", pixmap.tobytes(fmt)))
    document.close()
    media_type = "image/jpeg" if target == "jpg" else "image/png"
    if len(rendered) == 1:
        return ConvertedFile(rendered[0][1], rendered[0][0], media_type)
    archive = io.BytesIO()
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as bundle:
        for name, content in rendered:
            bundle.writestr(name, content)
    return ConvertedFile(archive.getvalue(), f"{stem}-{target}-pages.zip", "application/zip")


def _extract_text(data: bytes, ext: str) -> str:
    if ext == ".txt":
        return data.decode("utf-8-sig", errors="replace")
    document = Document(io.BytesIO(data))
    return "\n".join(paragraph.text for paragraph in document.paragraphs)


def _text_to_pdf(text: str, stem: str) -> ConvertedFile:
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", size=11)
    safe_text = text.encode("latin-1", errors="replace").decode("latin-1") or " "
    pdf.multi_cell(0, 7, safe_text)
    result = bytes(pdf.output())
    return ConvertedFile(result, f"{stem}.pdf", "application/pdf")
