import React from 'react'
import { LayoutDashboard, Mic, MessageSquare, Settings, Activity } from 'lucide-react'

const Sidebar = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'analysis', icon: Mic, label: 'Call Analysis' },
    { id: 'query', icon: MessageSquare, label: 'Knowledge Base' }
  ]

  return (
    <aside className="sidebar">
      <div className="brand">
        <Activity size={28} />
        GenCallAI
      </div>
      
      <nav className="nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <div 
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              <Icon size={20} />
              {item.label}
            </div>
          )
        })}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <div className="nav-item">
          <Settings size={20} />
          Settings
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
