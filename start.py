#!/usr/bin/env python
import os
import sys
import subprocess

# Get port from environment or default to 8000
port = os.getenv("PORT", "8000")

# Run gunicorn with uvicorn worker
cmd = [
    sys.executable,
    "-m",
    "gunicorn",
    "-w", "1",
    "-k", "uvicorn.workers.UvicornWorker",
    "app.main:app",
    "--bind", f"0.0.0.0:{port}",
    "--timeout", "600",
    "--access-logfile", "-",
    "--error-logfile", "-"
]

print(f"Starting server on port {port}...")
print(f"Command: {' '.join(cmd)}")
sys.exit(subprocess.call(cmd))
