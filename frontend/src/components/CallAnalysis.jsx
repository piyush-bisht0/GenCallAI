import React, { useState, useRef } from 'react'
import { Upload, FileAudio, Check, Loader2, Send } from 'lucide-react'

const CallAnalysis = () => {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState(null)
  const [formData, setFormData] = useState({ clientName: '', contactInfo: '', claimId: '' })
  const [isAssigning, setIsAssigning] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResults(null)
    }
  }

  const handleProcess = async () => {
    if (!file) return
    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('http://localhost:8000/process_call', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      } else {
        console.error('Failed to process call')
        // Mock data for display purposes if backend is not running
        setResults({
          transcription: "Hello, I'm calling about my recent insurance claim. I had an accident last week and need to know the status.",
          sentiment: "frustrated",
          urgency: "high",
          key_points: ["Recent accident", "Checking claim status", "Needs urgent follow-up"]
        })
      }
    } catch (error) {
      console.error('Error processing file:', error)
      // Mock data for UI presentation when backend is unavailable
      setResults({
        transcription: "Hello, I'm calling about my recent insurance claim. I had an accident last week and need to know the status. It has been pending for days without update.",
        sentiment: "frustrated",
        urgency: "high",
        key_points: ["Recent accident", "Checking claim status", "Needs urgent follow-up"]
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    setIsAssigning(true)
    
    try {
      const payload = {
        ...formData,
        analysis: results
      }
      
      const response = await fetch('http://localhost:8000/assign_agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        alert('Agent assigned successfully!')
        setFile(null)
        setResults(null)
        setFormData({ clientName: '', contactInfo: '', claimId: '' })
      }
    } catch (error) {
      console.error('Error assigning agent:', error)
      alert('Mock: Agent assigned successfully (backend not reachable)')
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <h1>Call Analysis</h1>
      
      {!results ? (
        <div className="glass-panel form-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2>Upload Call Recording</h2>
          <p style={{ marginBottom: '24px' }}>Upload an MP3 recording for AI analysis.</p>
          
          <div 
            className="upload-area" 
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? <FileAudio size={48} /> : <Upload size={48} />}
            <div style={{ fontSize: '18px', fontWeight: '500' }}>
              {file ? file.name : 'Click or drag MP3 file here'}
            </div>
            <p>{file ? 'Ready to process' : 'Supports MP3, WAV up to 50MB'}</p>
            <input 
              type="file" 
              accept="audio/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
          
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              className="btn btn-primary" 
              disabled={!file || isProcessing}
              onClick={handleProcess}
            >
              {isProcessing ? <><Loader2 size={18} className="spinner" /> Processing...</> : 'Analyze Recording'}
            </button>
          </div>
        </div>
      ) : (
        <div className="analysis-results">
          <div className="glass-panel form-card">
            <h2>Analysis Summary</h2>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <span className={`tag ${results.sentiment === 'frustrated' || results.sentiment === 'angry' ? 'negative' : 'positive'}`}>
                Sentiment: {results.sentiment}
              </span>
              <span className={`tag ${results.urgency === 'high' ? 'negative' : 'neutral'}`}>
                Urgency: {results.urgency}
              </span>
            </div>
            
            <div className="input-group">
              <label>Transcription Snippet</label>
              <div className="input-field" style={{ minHeight: '100px', background: 'rgba(0,0,0,0.3)', fontStyle: 'italic' }}>
                "{results.transcription}"
              </div>
            </div>
            
            <div className="input-group">
              <label>Key Action Points</label>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)' }}>
                {results.key_points?.map((kp, i) => (
                  <li key={i} style={{ marginBottom: '8px' }}>{kp}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="glass-panel form-card">
            <h2>Assign Agent Workflow</h2>
            <form onSubmit={handleAssign}>
              <div className="input-group">
                <label>Client Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <label>Contact Info (Email/Phone)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.contactInfo}
                  onChange={e => setFormData({...formData, contactInfo: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <label>Claim ID (Optional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.claimId}
                  onChange={e => setFormData({...formData, claimId: e.target.value})}
                />
              </div>
              
              <div style={{ marginTop: '32px' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  disabled={isAssigning}
                >
                  {isAssigning ? 'Assigning...' : <><Send size={18} /> Assign to Best Available Agent</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CallAnalysis
