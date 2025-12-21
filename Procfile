web: python -m pip install -r requirements.txt && python -m gunicorn -w 1 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:${PORT:-8000} --timeout 600 --access-logfile - --error-logfile -
