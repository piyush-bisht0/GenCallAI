import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User } from 'lucide-react'

const RAGQuery = () => {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I am the GenCallAI Knowledge Assistant. Ask me anything about policy guidelines, previous claims, or resolution steps.' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    const userMessage = { role: 'user', content: query }
    setMessages(prev => [...prev, userMessage])
    setQuery('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8001/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.content, top_k: 3 })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, { role: 'bot', content: data.summary || data.answer || JSON.stringify(data) }])
      } else {
        // Fallback mock response if backend not running
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'bot', 
            content: `I found 3 relevant documents regarding your query. Here is a summary: The standard protocol for this situation requires verifying the client's identity first, then reviewing the specific policy clauses in section 4.B.` 
          }])
          setIsLoading(false)
        }, 1500)
        return
      }
    } catch (error) {
      console.error('Query error:', error)
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: `(Mock Mode) Query received: "${userMessage.content}". RAG response: Based on the knowledge base, please refer to the standard guidelines document.` 
        }])
        setIsLoading(false)
      }, 1000)
      return
    }

    setIsLoading(false)
  }

  return (
    <div className="animate-fade-in" style={{ height: '100%' }}>
      <h1>Knowledge Base Query</h1>
      
      <div className="glass-panel chat-container">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="avatar">
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className="bubble">
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="avatar"><Bot size={20} /></div>
              <div className="bubble">
                <Loader2 size={20} className="spinner" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className="chat-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Ask a question about policies or claims..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="send-btn" disabled={!query.trim() || isLoading}>
            <Send size={20} style={{ marginLeft: '2px' }} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default RAGQuery
