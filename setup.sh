#!/bin/bash
set -e

echo "Setting up GenCallAI..."

echo "1. Setting up Routing API..."
cd routing_api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python intialize_databases.py
deactivate
cd ..

echo "2. Setting up RAG API..."
cd rag_api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

echo "3. Frontend setup is handled by Vite (npm install / npm run dev)"

echo "Done!"
