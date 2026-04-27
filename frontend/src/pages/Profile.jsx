import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Profile() {
  const [preferences, setPreferences] = useState({ language: 'en', name: 'User' })
  const [languages, setLanguages] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [prefRes, langRes] = await Promise.all([
        axios.get('http://localhost:8000/user/preferences'),
        axios.get('http://localhost:8000/languages')
      ])
      setPreferences(prefRes.data)
      setLanguages(langRes.data.languages)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await axios.post('http://localhost:8000/user/preferences', preferences)
      localStorage.setItem('preferredLanguage', preferences.language)
      setMessage('Settings saved successfully!')
    } catch (err) {
      setMessage('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const clearHistory = async () => {
    if (confirm('Are you sure you want to clear all history?')) {
      try {
        await axios.post('http://localhost:8000/user/history/0')
        setMessage('History cleared!')
      } catch (err) {
        setMessage('Failed to clear history')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <div className="animate-spin w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <nav className="bg-navy-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link to="/dashboard" className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-white font-bold text-xl">Settings</h1>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-navy-800 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-saffron-500 to-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">न्य</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Nyayasaathi</h2>
              <p className="text-slate-400">Your Justice Companion</p>
            </div>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg ${message.includes('success') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Display Name</label>
              <input
                type="text"
                value={preferences.name}
                onChange={(e) => setPreferences({ ...preferences, name: e.target.value })}
                className="w-full bg-navy-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:outline-none focus:border-accent-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Preferred Language</label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                className="w-full bg-navy-700 text-white rounded-lg px-4 py-3 border border-slate-600 focus:outline-none focus:border-accent-500"
              >
                {Object.entries(languages).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
              <p className="text-slate-500 text-xs mt-2">AI will respond in your selected language</p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 w-full bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/50 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>

        <div className="bg-navy-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-white font-bold text-lg mb-4">Data Management</h3>
          <button
            onClick={clearHistory}
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All History
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">Nyayasaathi v2.0</p>
          <p className="text-slate-600 text-xs mt-1">Powered by Groq AI • For Indian Law</p>
        </div>
      </div>
    </div>
  )
}

export default Profile