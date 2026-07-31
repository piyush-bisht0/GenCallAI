# GenCallAI: AI Call Routing & Document RAG Platform

## Overview
End-to-end AI platform optimizing BPO call routing via hybrid sentiment and accelerating query resolution via hybrid RAG. 

## Features
- **Dual-Modal Call Analysis**: Fuses TextBlob NLP and librosa metrics (RMS/MFCCs) to evaluate 4 distinct customer call metrics seamlessly.
- **Intent Extraction**: Extracts real-time intent using spaCy NER and KeyBERT to feed a custom `heapq` priority queue, optimizing call routing across 6 variables.
- **Hybrid RAG Pipeline**: Leverages LangChain, BM25, 384-dim Milvus vector search, and monoT5 reranking for exact contextual relevance.
- **Full-Stack Application**: Operationalized into an end-to-end application with a React frontend, 2 FastAPI microservices, and an SQLite database layer.

## Project Structure
- `frontend/`: Premium React application providing the user interface for call uploads, agent dashboard, and RAG querying.
- `routing_api/`: FastAPI microservice responsible for audio transcription, deep NLP/Audio analysis, and intelligent agent routing.
- `rag_api/`: FastAPI microservice executing the hybrid retrieval augmented generation pipeline.

## Getting Started
Run `bash setup.sh` to initialize the Python environments and install dependencies for the microservices.
Navigate to the `frontend/` directory and run `npm install && npm run dev` to launch the React application.
