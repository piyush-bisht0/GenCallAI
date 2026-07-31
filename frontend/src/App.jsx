import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import CallAnalysis from './components/CallAnalysis'
import RAGQuery from './components/RAGQuery'

function App() {
  const [activeView, setActiveView] = useState('dashboard')

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="main-content">
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'analysis' && <CallAnalysis />}
        {activeView === 'query' && <RAGQuery />}
      </main>
    </div>
  )
}

export default App
