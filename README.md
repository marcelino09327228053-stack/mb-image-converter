# MB Image Converter

Standalone responsive file converter.

Run `run.bat`, then open `http://localhost:8010`.

Files are processed in memory and are not permanently stored. Maximum upload size is 100 MB per file, with up to 20 files per conversion.

## Online deployment

This app requires a Python server; static-only hosting cannot run conversions.

For a container host, build the included `Dockerfile`. The server listens on
`0.0.0.0` and uses the host's `PORT` environment variable (default: `8000`).
Configure the health check path as `/health`.

For a Python host, install `requirements.txt` and use this start command:

```sh
python -m uvicorn main:app --host 0.0.0.0 --port $PORT
```

Use Python 3.12 and set `PORT` if the provider does not supply it. A `Procfile`
is included for hosts that support it. The app needs no database or persistent
storage. Configure HTTPS through the hosting provider.

After deployment, check `/health`, open `/`, and upload a small image to verify
conversion and download. Large files and PDF rendering can require substantially
more memory than the upload size; choose host resources and request limits accordingly.
