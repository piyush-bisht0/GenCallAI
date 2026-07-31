import React from 'react'
import { Users, PhoneCall, CheckCircle, Clock } from 'lucide-react'

const Dashboard = () => {
  const stats = [
    { label: 'Active Agents', value: '24', change: '+2', positive: true, icon: Users },
    { label: 'Calls Today', value: '1,284', change: '+12%', positive: true, icon: PhoneCall },
    { label: 'Avg Resolution', value: '4m 12s', change: '-30s', positive: true, icon: Clock },
    { label: 'Success Rate', value: '94.2%', change: '-0.4%', positive: false, icon: CheckCircle }
  ]

  return (
    <div className="animate-fade-in">
      <h1>Dashboard Overview</h1>
      
      <div className="stats-grid">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="glass-panel stat-card">
              <div className="stat-header">
                <div className="stat-icon"><Icon size={24} className="text-primary" /></div>
                <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                  {stat.change}
                </div>
              </div>
              <div>
                <div className="stat-value">{stat.value}</div>
                <h3 style={{ marginBottom: 0 }}>{stat.label}</h3>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="glass-panel" style={{ padding: '24px', minHeight: '300px' }}>
        <h2>Live Agent Status</h2>
        <p>No active calls at the moment. System is running optimally.</p>
      </div>
    </div>
  )
}

export default Dashboard
