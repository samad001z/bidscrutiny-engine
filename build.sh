#!/bin/bash
set -e

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Dependencies installed successfully!"
echo "Ready to start the application..."
