#!/bin/bash
set -e

echo "Installing dependencies from requirements.txt..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

echo "Dependencies installed successfully!"
