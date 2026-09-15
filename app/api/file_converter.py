"""Public, stateless file conversion endpoints."""

import io
import zipfile
from collections import Counter
from urllib.parse import quote

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app.services.file_conversion_service import MAX_FILE_SIZE, available_targets, convert_file

router = APIRouter(prefix="/api/converter", tags=["file converter"])


@router.post("/targets")
async def conversion_targets(file: UploadFile = File(...)):
    return {"filename": file.filename, "targets": available_targets(file.filename or "")}


@router.post("/convert")
async def convert(files: list[UploadFile] = File(..., alias="file"), target: str = Form(...)):
    if len(files) > 20:
        raise HTTPException(status_code=400, detail="Hanggang 20 files lang bawat conversion.")
    results = []
    for file in files:
        data = await file.read(MAX_FILE_SIZE + 1)
        if not data:
            raise HTTPException(status_code=400, detail=f"Walang laman ang {file.filename}.")
        if len(data) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail=f"Lampas 100 MB ang {file.filename}.")
        try:
            results.append(convert_file(data, file.filename or "file", target))
        except (ValueError, OSError) as exc:
            raise HTTPException(status_code=400, detail=f"{file.filename}: {exc}") from exc
    if len(results) == 1:
        result = results[0]
        output, filename, media_type = result.data, result.filename, result.media_type
    else:
        archive = io.BytesIO()
        used = Counter()
        with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as bundle:
            for result in results:
                used[result.filename] += 1
                name = result.filename
                if used[name] > 1:
                    base, dot, suffix = name.rpartition(".")
                    name = f"{base}-{used[name]}.{suffix}" if dot else f"{name}-{used[name]}"
                bundle.writestr(name, result.data)
        output, filename, media_type = archive.getvalue(), f"mb-image-converter-{target}-converted.zip", "application/zip"
    encoded_name = quote(filename)
    return StreamingResponse(
        io.BytesIO(output),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded_name}"},
    )
