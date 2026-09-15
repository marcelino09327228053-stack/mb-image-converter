import io
import unittest
import zipfile

import pymupdf
from fastapi import UploadFile
from PIL import Image
from app.api.file_converter import convert


class BatchConversionTests(unittest.IsolatedAsyncioTestCase):
    async def convert_batch(self, names, target):
        files = []
        for index, name in enumerate(names):
            buffer = io.BytesIO()
            Image.new("RGB", (30 + index * 10, 20), (index * 40, 80, 120)).save(buffer, "PNG")
            files.append(UploadFile(filename=name, file=io.BytesIO(buffer.getvalue())))
        response = await convert(files=files, target=target)
        data = b"".join([chunk async for chunk in response.body_iterator])
        return response, data

    async def test_five_images_become_one_pdf_in_order(self):
        response, data = await self.convert_batch([f"page{i}.png" for i in range(5)], "pdf")
        self.assertEqual(response.media_type, "application/pdf")
        with pymupdf.open(stream=data, filetype="pdf") as document:
            self.assertEqual(document.page_count, 5)
            widths = [document.extract_image(page.get_images()[0][0])["width"] for page in document]
            self.assertEqual(widths, [30, 40, 50, 60, 70])

    async def test_zip_preserves_every_file_with_colliding_names(self):
        response, data = await self.convert_batch(["photo.png", "photo.png", "photo-2.png"], "jpg")
        self.assertEqual(response.media_type, "application/zip")
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            self.assertEqual(len(archive.namelist()), 3)
            self.assertEqual(len(set(archive.namelist())), 3)
            widths = [Image.open(io.BytesIO(archive.read(name))).width for name in archive.namelist()]
            self.assertEqual(widths, [30, 40, 50])

    async def test_single_image_remains_single_file(self):
        response, data = await self.convert_batch(["photo.png"], "jpg")
        self.assertEqual(response.media_type, "image/jpeg")
        self.assertEqual(Image.open(io.BytesIO(data)).size, (30, 20))


if __name__ == "__main__":
    unittest.main()
