#!/bin/bash

echo "🚀 Starting BidScrutiny Engine..."
echo "=================================="

# Check critical environment variables
if [ -z "$FIREBASE_SERVICE_ACCOUNT_BASE64" ]; then
    echo "⚠️  WARNING: FIREBASE_SERVICE_ACCOUNT_BASE64 not set"
    echo "   Set this in Railway Variables tab"
fi

if [ -z "$FIREBASE_STORAGE_BUCKET" ]; then
    echo "⚠️  WARNING: FIREBASE_STORAGE_BUCKET not set"
    echo "   Set this in Railway Variables tab"
fi

if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  WARNING: GEMINI_API_KEY not set"
    echo "   Set this in Railway Variables tab"
fi

if [ -z "$PORT" ]; then
    echo "⚠️  WARNING: PORT not set, using default 8000"
    export PORT=8000
fi

echo ""
echo "✓ Environment:"
echo "  - PORT: $PORT"
echo "  - ENV: ${ENV:-development}"
echo "  - Firebase Bucket: ${FIREBASE_STORAGE_BUCKET:-not set}"
echo "  - Gemini API: ${GEMINI_API_KEY:0:10}***"
echo ""
echo "=================================="
echo "Starting uvicorn server..."
echo ""

# Start the server
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
