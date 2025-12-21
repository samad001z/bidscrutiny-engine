#!/bin/bash
set -e

echo "Installing dependencies..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo "Dependencies installed successfully!"
echo "Ready to start the application..."
