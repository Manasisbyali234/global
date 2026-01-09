#!/bin/bash

echo "Starting Tale Global Backend Server..."
echo

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

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
echo "Starting server on port 5000..."
echo "Backend will be available at: http://localhost:5000"
echo "Health check: http://localhost:5000/health"
echo "API Health check: http://localhost:5000/api/health"
echo

npm start