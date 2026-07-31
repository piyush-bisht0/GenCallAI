#!/bin/bash
cd /home/piyush/.gemini/antigravity/scratch/GenCallAI

echo "Starting Routing API setup..."
cd routing_api
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
echo "Starting Routing API on port 8000..."
nohup uvicorn api:app --reload --port 8000 > routing.log 2>&1 &

echo "Starting RAG API setup..."
cd ../rag_api
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
echo "Starting RAG API on port 8001..."
nohup uvicorn src.api:app --reload --port 8001 > rag.log 2>&1 &

echo "Starting React Frontend..."
cd ../frontend
nohup npm run dev > frontend.log 2>&1 &

echo "All services are installing and booting up in the background!"
