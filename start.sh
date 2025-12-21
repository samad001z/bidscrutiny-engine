#!/bin/bash
set -e

echo "🚀 Installing dependencies..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo "🚀 Starting BidScrutiny Engine..."
echo "=================================="

# Check critical environment variables
if [ -z "$FIREBASE_SERVICE_ACCOUNT_BASE64" ]; then
    echo "⚠️  WARNING: FIREBASE_SERVICE_ACCOUNT_BASE64 not set"
fi

if [ -z "$FIREBASE_STORAGE_BUCKET" ]; then
    echo "⚠️  WARNING: FIREBASE_STORAGE_BUCKET not set"
fi

if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  WARNING: GEMINI_API_KEY not set"
fi

PORT=${PORT:-8000}
export PORT=$PORT

echo ""
echo "✓ Environment:"
echo "  - PORT: $PORT"
echo "  - Firebase Bucket: ${FIREBASE_STORAGE_BUCKET:-not set}"
echo ""
echo "=================================="
echo "Starting gunicorn server with uvicorn worker..."
echo ""

# Start the server
exec python -m gunicorn \
  -w 1 \
  -k uvicorn.workers.UvicornWorker \
  app.main:app \
  --bind 0.0.0.0:$PORT \
  --timeout 600 \
  --access-logfile - \
  --error-logfile -
