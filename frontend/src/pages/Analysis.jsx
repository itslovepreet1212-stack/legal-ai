import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import RiskBadge from '../components/RiskBadge'
import Chatbot from '../components/Chatbot'

function Analysis({ analysisData, setAnalysisData }) {
  const [showChat, setShowChat] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!analysisData) {
      const stored = localStorage.getItem('analysisData')
      if (stored) {
        setAnalysisData(JSON.parse(stored))
      } else {
        navigate('/')
      }
    }
  }, [analysisData, setAnalysisData, navigate])

  if (!analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-900">
        <div className="animate-spin w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const { filename, analysis } = analysisData

  return (
    <div className="min-h-screen bg-navy-900 pb-24">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-400 hover:text-white text-sm flex items-center gap-2 mb-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-white">{filename}</h1>
          </div>
          <RiskBadge level={analysis.risk_level} size="large" />
        </div>

        <div className="grid gap-6">
          <div className="bg-navy-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-saffron-500 to-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Document Type</p>
                <p className="text-white font-semibold text-lg">{analysis.document_type}</p>
              </div>
            </div>
          </div>

          <div className="bg-navy-800 rounded-xl p-6">
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-saffron-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Summary
            </h2>
            <p className="text-slate-300 leading-relaxed">{analysis.summary}</p>
          </div>

          {analysis.key_parties && analysis.key_parties.length > 0 && (
            <div className="bg-navy-800 rounded-xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Key Parties
              </h2>
              <div className="flex flex-wrap gap-2">
                {analysis.key_parties.map((party, index) => (
                  <span key={index} className="px-3 py-1.5 bg-navy-700 text-slate-300 rounded-full text-sm">
                    {party}
                  </span>
                ))}
              </div>
            </div>
          )}

          {analysis.risks && analysis.risks.length > 0 && (
            <div className="bg-navy-800 rounded-xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Risky Clauses
              </h2>
              <div className="space-y-4">
                {analysis.risks.map((risk, index) => (
                  <div key={index} className="bg-navy-700 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium">{risk.clause}</h3>
                      <RiskBadge level={risk.risk} />
                    </div>
                    <p className="text-slate-400 text-sm">{risk.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.key_obligations && analysis.key_obligations.length > 0 && (
            <div className="bg-navy-800 rounded-xl p-6">
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-saffron-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Key Obligations
              </h2>
              <ul className="space-y-3">
                {analysis.key_obligations.map((obligation, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-saffron-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-saffron-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-slate-300">{obligation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.red_flags && analysis.red_flags.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <h2 className="text-red-400 font-semibold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Red Flags
              </h2>
              <ul className="space-y-3">
                {analysis.red_flags.map((flag, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-red-200">{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/lawyers')}
              className="flex-1 bg-gradient-to-r from-saffron-500 to-orange-600 hover:from-saffron-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Find Nearby Lawyers
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-4 bg-navy-700 hover:bg-navy-600 text-white rounded-xl font-semibold transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-saffron-500 to-green-500 hover:shadow-lg hover:shadow-saffron-500/30 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-40"
        title="Chat about your document"
      >
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {showChat && (
        <Chatbot
          filename={filename}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  )
}

export default Analysis