#!/bin/bash

echo
echo "========================================"
echo "   CLUTCH PLATFORM - UNIFIED BACKEND"
echo "========================================"
echo
echo "Starting the consolidated shared backend..."
echo "This backend now serves ALL Clutch applications"
echo

cd shared-backend

echo "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        exit 1
    fi
fi

echo
echo "Starting unified backend on port 5000..."
echo
echo "The backend will serve:"
echo "- Client Dashboard"
echo "- Web Dashboard  "
echo "- Client Mobile App"
echo "- Mechanics Mobile App"
echo "- Admin Panel"
echo
echo "Press Ctrl+C to stop the server"
echo

npm start
