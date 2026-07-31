from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from database.agent_database import get_agent_by_id, get_all_agents, get_agent_schedule
from database.client_database import get_client_by_id, get_calls_by_client, get_all_clients, add_client
from pydub import AudioSegment
import speech_recognition as sr
import os
import tempfile
from call_analyzer import CallAnalyzer
from utils.agent_matching import assign_agent_and_schedule
from pydantic import BaseModel
from typing import Dict, Any, Optional

call_analyzer = CallAnalyzer()

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for cross-origin access
# This allows access to the API from web apps, mobile apps, etc.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins. Change this in production to allow specific origins.
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Define your API endpoints here

# --- API ROUTES ---

# 1. Fetch agent details by their AgentID
@app.get("/agents/{agent_id}")
async def get_agent_details(agent_id: int):
    """
    Get detailed information about a specific agent by their unique AgentID.

    Args:
        agent_id (int): The unique ID of the agent.

    Returns:
        JSON object with the agent's details:
        {
            "AgentID": int,
            "Name": str,
            "Proficiency": str,
            "Specialization": str,
            "Status": str,
            "CurrentCalls": int,
            "ShiftStart": str,
            "ShiftEnd": str,
            "TirednessLevel": int
        }

    HTTP 404 Error if the agent is not found.
    """
    agent = get_agent_by_id(agent_id)
    if agent is None:
        raise HTTPException(status_code=404, detail=f"Agent with ID {agent_id} not found.")
    return agent  # JSON response with agent details


# 2. Fetch details of all agents (useful for debugging or showing all agent data)
@app.get("/agents/")
async def get_all_agents_api():
    """
    Get details of all agents in the system.

    Returns:
        JSON array, where each item represents an agent:
        [
            {
                "AgentID": int,
                "Name": str,
                "Proficiency": str,
                "Specialization": str,
                "Status": str,
                "CurrentCalls": int,
                "ShiftStart": str,
                "ShiftEnd": str,
                "TirednessLevel": int
            },
            ...
        ]
    """
    agents = get_all_agents()
    return agents  # JSON response with all agents


# 3. Fetch client details by their ClientID
@app.get("/clients/{client_id}")
async def get_client_details(client_id: int):
    """
    Get detailed information about a specific client by their unique ClientID.

    Args:
        client_id (int): The unique ID of the client.

    Returns:
        JSON object with the client's details:
        {
            "ClientID": int,
            "Name": str,
            "ContactInfo": str,
            "FirstTimeCaller": bool
        }

    HTTP 404 Error if the client is not found.
    """
    client = get_client_by_id(client_id)
    if client is None:
        raise HTTPException(status_code=404, detail=f"Client with ID {client_id} not found.")
    return client  # JSON response with client details


# 4. Fetch all call history for a specific client by their ClientID
@app.get("/clients/{client_id}/calls")
async def get_client_call_history(client_id: int):
    """
    Get the call history of a specific client by their unique ClientID.

    Args:
        client_id (int): The unique ID of the client.

    Returns:
        JSON array, where each item represents a call made by the client:
        [
            {
                "ClientID": int,
                "Metadata": str,
                "Transcription": str,
                "Sentiment": str,
                "Urgency": str,
                "Intent": str,
                "ClaimID": int,
                "AssignedAgentID": int
            },
            ...
        ]

    HTTP 404 Error if no calls are found for the client.
    """
    calls = get_calls_by_client(client_id)
    if not calls:
        raise HTTPException(status_code=404, detail=f"No calls found for client with ID {client_id}.")
    return calls  # JSON response with client's call history


# 5. Fetch all calls assigned to a specific agent, sorted by time (agent's schedule)
@app.get("/agents/{agent_id}/schedule")
async def get_agent_schedule_api(agent_id: int):
    """
    Get the schedule of a specific agent by their unique AgentID.
    The schedule includes all calls assigned to the agent, sorted by time.

    Args:
        agent_id (int): The unique ID of the agent.

    Returns:
        JSON array, where each item represents a scheduled call:
        [
            {
                "ScheduleID": int,
                "AgentID": int,
                "ClientID": int,
                "StartTime": str,
                "EndTime": str,
                "ClientName": str,
                "ClientContactInfo": str,
                "ClientFirstTimeCaller": bool
            },
            ...
        ]

    HTTP 404 Error if the agent or their schedule cannot be found.
    """
    # Check if agent exists (to validate the agent_id)
    agent = get_agent_by_id(agent_id)
    if agent is None:
        raise HTTPException(status_code=404, detail=f"Agent with ID {agent_id} not found.")

    # Retrieve the agent's schedule from the database
    schedule = get_agent_schedule(agent_id)
    if not schedule:
        raise HTTPException(status_code=404, detail=f"No schedule found for agent with ID {agent_id}.")
    return schedule  # JSON response with agent's schedule


# 6. Fetch all clients and their call histories
@app.get("/clients/")
async def get_all_clients_api():
    """
    Get details of all clients in the system along with their call histories.

    Returns:
        JSON array, where each item represents a client and their call history:
        [
            {
                "ClientID": int,
                "Name": str,
                "ContactInfo": str,
                "FirstTimeCaller": bool,
                "CallHistory": [
                    {
                        "ClientID": int,
                        "Metadata": str,
                        "Transcription": str,
                        "Sentiment": str,
                        "Urgency": str,
                        "Intent": str,
                        "ClaimID": int,
                        "AssignedAgentID": int
                    },
                    ...
                ]
            },
            ...
        ]
    """
    clients = get_all_clients()
    for client in clients:
        client["CallHistory"] = get_calls_by_client(client["ClientID"])
    return clients  # JSON response with all clients and their call histories


# 7. Fetch agent's schedule along with client's call history
@app.get("/agents/{agent_id}/schedule_with_client_history")
async def get_agent_schedule_with_client_history(agent_id: int):
    """
    Get the schedule of a specific agent by their unique AgentID along with the call history of each client in the schedule.

    Args:
        agent_id (int): The unique ID of the agent.

    Returns:
        JSON array, where each item represents a scheduled call along with the client's call history:
        [
            {
                "ScheduleID": int,
                "AgentID": int,
                "ClientID": int,
                "StartTime": str,
                "EndTime": str,
                "ClientName": str,
                "ClientContactInfo": str,
                "ClientFirstTimeCaller": bool,
                "ClientCallHistory": [
                    {
                        "ClientID": int,
                        "Metadata": str,
                        "Transcription": str,
                        "Sentiment": str,
                        "Urgency": str,
                        "Intent": str,
                        "ClaimID": int,
                        "AssignedAgentID": int
                    },
                    ...
                ]
            },
            ...
        ]

    HTTP 404 Error if the agent or their schedule cannot be found.
    """
    # Check if agent exists (to validate the agent_id)
    agent = get_agent_by_id(agent_id)
    if agent is None:
        raise HTTPException(status_code=404, detail=f"Agent with ID {agent_id} not found.")

    # Retrieve the agent's schedule from the database
    schedule = get_agent_schedule(agent_id)
    if not schedule:
        raise HTTPException(status_code=404, detail=f"No schedule found for agent with ID {agent_id}.")

    # Add client's call history to each schedule entry
    for entry in schedule:
        client_id = entry["ClientID"]
        entry["ClientCallHistory"] = get_calls_by_client(client_id)

    return schedule  # JSON response with agent's schedule and client's call history


# 8. Upload and process call audio
@app.post("/process_call")
async def process_call(file: UploadFile = File(...)):
    """
    Upload an audio file (.mp3), transcribe it, and perform deep analysis.
    """
    if not file.filename.endswith(".mp3"):
        raise HTTPException(status_code=400, detail="Only .mp3 files are supported")
    
    # Save uploaded file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_mp3:
        content = await file.read()
        temp_mp3.write(content)
        temp_mp3_path = temp_mp3.name

    try:
        # Convert MP3 to WAV
        audio = AudioSegment.from_file(temp_mp3_path)
        temp_wav_path = temp_mp3_path.replace(".mp3", ".wav")
        audio.export(temp_wav_path, format="wav")

        # Transcribe
        recognizer = sr.Recognizer()
        with sr.AudioFile(temp_wav_path) as source:
            audio_data = recognizer.record(source)
            try:
                transcription = recognizer.recognize_google(audio_data)
            except sr.UnknownValueError:
                raise HTTPException(status_code=400, detail="Speech Recognition could not understand the audio.")
            except sr.RequestError as e:
                raise HTTPException(status_code=500, detail=f"Could not request results from Speech Recognition: {e}")

        # Analyze
        analysis_results = call_analyzer.analyze(transcription, temp_wav_path)
        language_proficiency = call_analyzer.analyze_language_proficiency(transcription)

        return {
            "transcription": transcription,
            "analysis": analysis_results,
            "language_proficiency": language_proficiency
        }
    finally:
        # Cleanup
        if os.path.exists(temp_mp3_path):
            os.remove(temp_mp3_path)
        if 'temp_wav_path' in locals() and os.path.exists(temp_wav_path):
            os.remove(temp_wav_path)


class AssignAgentRequest(BaseModel):
    # Fields sent by the React frontend
    clientName: Optional[str] = None
    contactInfo: Optional[str] = None
    claimId: Optional[str] = None
    analysis: Optional[Dict[str, Any]] = None
    # Fields sent by direct API calls
    client_name: Optional[str] = None
    contact_info: Optional[str] = None
    first_time_caller: bool = False
    claim_id: Optional[int] = None
    urgency: Optional[str] = "low"
    intent: Optional[str] = "General Inquiry"
    metadata: Optional[Dict[str, Any]] = {}
    transcription: Optional[str] = ""
    sentiment: Optional[str] = "Neutral"

# 9. Assign agent to call
@app.post("/assign_agent")
async def assign_agent(request: AssignAgentRequest):
    """
    Assign an agent based on call analysis and schedule the call.
    Accepts both camelCase fields (from React frontend) and snake_case fields (direct API).
    """
    # Resolve field names from either camelCase (frontend) or snake_case (direct API)
    name = request.client_name or request.clientName or "Unknown"
    contact = request.contact_info or request.contactInfo or ""
    analysis = request.analysis or {}
    urgency = request.urgency or analysis.get("urgency", "low")
    intent = request.intent or analysis.get("intent", "General Inquiry")
    sentiment = request.sentiment or analysis.get("sentiment", "Neutral")
    metadata = request.metadata or analysis.get("metadata", {})
    transcription = request.transcription or analysis.get("transcription", "")
    claim_id = request.claim_id or (int(request.claimId) if request.claimId and request.claimId.isdigit() else 0)

    client_id = add_client(name, contact, request.first_time_caller)

    matched_agent = assign_agent_and_schedule(
        client_id=client_id,
        urgency=urgency,
        intent=intent,
        metadata=metadata,
        transcription=transcription,
        sentiment=sentiment,
        claim_id=claim_id
    )

    if not matched_agent:
        raise HTTPException(status_code=404, detail="No suitable agent found.")

    return {
        "matched_agent": matched_agent,
        "client_id": client_id
    }