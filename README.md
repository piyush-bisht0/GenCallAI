GenCallAI: AI Call Routing & Document RAG Platform
==================================================

Overview
--------
GenCallAI is an end-to-end AI platform optimizing BPO call routing via hybrid sentiment and accelerating query resolution via hybrid RAG. The system fuses NLP with real-time audio metrics to route calls to the best-suited agents, while providing agents with a semantic search interface.

Core Capabilities
-----------------
* Dual-Modal Engine: Fuses TextBlob NLP and librosa metrics (RMS/MFCCs) to evaluate 4 distinct customer call metrics seamlessly.
* Real-Time Intent Extraction: Utilizes spaCy NER and KeyBERT to feed a custom heapq priority queue, optimizing call routing across 6 variables.
* Hybrid RAG Pipeline: Built with LangChain, BM25, 384-dimensional Milvus vector search, and monoT5 reranking for exact contextual relevance.
* Full-Stack Architecture: Operationalized into an end-to-end application with a React frontend, 2 FastAPI microservices, and an SQLite database layer.

System Architecture
-------------------
The platform operates as a distributed microservice architecture:
1. Frontend (React/Vite)
2. Routing Backend (FastAPI, SQLite)
3. RAG Backend (FastAPI, LangChain, Milvus)

Tech Stack
----------
* Frontend: React.js (Vite), CSS3
* Call Routing API: FastAPI, pydub, librosa, speechrecognition, spaCy, KeyBERT, TextBlob, SQLite
* Hybrid RAG API: FastAPI, Milvus, LangChain, sentence-transformers, Google Gemini GenAI

Getting Started
---------------
1. Initialize the Environment
   $ bash setup.sh

2. Start the Microservices
   Call Routing API (Port 8000):
   $ cd routing_api
   $ source venv/bin/activate
   $ uvicorn api:app --reload --port 8000

   RAG API (Port 8001):
   $ cd rag_api
   $ source venv/bin/activate
   $ uvicorn src.api:app --reload --port 8001

3. Start the Frontend Application
   $ cd frontend
   $ npm install
   $ npm run dev

Project Structure
-----------------
frontend/       React UI providing dashboard views, audio uploads, and chat interfaces.
routing_api/    CallAnalyzer, speech-to-text integration, and heapq agent assignment.
rag_api/        Document retrieval module.
