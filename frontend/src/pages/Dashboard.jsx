import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Dashboard() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8000/user/history?limit=20')
      setHistory(response.data.history)
    } catch (err) {
      console.error('Failed to fetch history:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'bg-red-500'
      case 'Medium': return 'bg-yellow-500'
      case 'Low': return 'bg-green-500'
      default: return 'bg-slate-500'
    }
  }

  const getTypeIcon = (type) => {
    return type === 'image' ? (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <nav className="bg-navy-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-saffron-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">न्य</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Nyayasaathi</h1>
              <p className="text-slate-400 text-xs">न्यायसाथी</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/chat" className="text-slate-300 hover:text-white flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-navy-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat
            </Link>
            <Link to="/profile" className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-navy-700 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to Nyayasaathi</h2>
          <p className="text-slate-400">Your AI-powered legal assistant for Indian law</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/" className="bg-gradient-to-br from-saffron-500 to-orange-600 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-saffron-500/20 transition-all">
            <svg className="w-10 h-10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <h3 className="font-bold text-xl mb-1">Upload Document</h3>
            <p className="text-white/80 text-sm">Analyze PDF, DOCX or image</p>
          </Link>

          <Link to="/chat" className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-green-500/20 transition-all">
            <svg className="w-10 h-10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="font-bold text-xl mb-1">Legal Chat</h3>
            <p className="text-white/80 text-sm">Ask any legal question</p>
          </Link>

          <div className="bg-navy-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-white">Total Analyses</h3>
            </div>
            <p className="text-4xl font-bold text-accent-500">{history.length}</p>
          </div>
        </div>

        <div className="bg-navy-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Recent Analyses</h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-400 mb-4">No documents analyzed yet</p>
              <Link to="/" className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg font-medium inline-block">
                Upload Your First Document
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="bg-navy-700 rounded-lg p-4 flex items-center gap-4 hover:bg-navy-600 transition-colors cursor-pointer" onClick={() => {
                  const data = { filename: entry.filename, analysis: { document_type: entry.document_type, summary: entry.summary, risk_level: entry.risk_level } }
                  localStorage.setItem('analysisData', JSON.stringify(data))
                  navigate('/analysis')
                }}>
                  <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center text-slate-300">
                    {getTypeIcon(entry.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{entry.filename}</p>
                    <p className="text-slate-400 text-sm">{entry.document_type}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getRiskColor(entry.risk_level)}`} />
                  <div className="text-slate-500 text-sm">{formatDate(entry.timestamp)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-navy-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Quick Legal Resources</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'IPC Sections', icon: '📖' },
              { name: 'Constitution', icon: '🏛️' },
              { name: 'Consumer Rights', icon: '🛡️' },
              { name: 'Property Law', icon: '🏠' },
            ].map((resource) => (
              <Link to="/chat" key={resource.name} className="bg-navy-700 rounded-lg p-4 text-center hover:bg-navy-600 transition-colors">
                <span className="text-2xl mb-2 block">{resource.icon}</span>
                <p className="text-slate-300 text-sm font-medium">{resource.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard