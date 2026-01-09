#!/bin/bash

echo "Starting Tale Global Frontend..."
echo

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/frontend"

echo "Checking if Node.js is installed..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js version:"
node --version

echo
echo "Installing dependencies..."
npm install

echo
echo "Starting frontend development server..."
echo "Frontend will be available at: http://localhost:3000"
echo "Make sure backend is running at: http://localhost:5000"
echo

npm start