import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

function GeneralChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'नमस्ते! मैं Nyayasaathi हूं, आपका विधिक सहायक। आप भारतीय कानून के बारे में कोई भी सवाल पूछ सकते हैं - जैसे IPC धाराएं, संविधान अधिकार, FIR, कोर्ट नोटिस, या कोई विधिक प्रक्रिया।\n\nHello! I am Nyayasaathi, your legal assistant. You can ask any question about Indian law - like IPC sections, constitutional rights, FIR, court notices, or any legal procedure.'
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [language, setLanguage] = useState('en')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage')
    if (savedLang) setLanguage(savedLang)
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    const currentInput = input.trim()
    setInput('')
    setIsTyping(true)

    try {
      const chatHistory = messages.map(({ role, content }) => ({ role, content }))
      const response = await axios.post('http://localhost:8000/general-chat', {
        message: currentInput,
        chat_history: chatHistory,
        language: language
      })

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.answer }
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      <nav className="bg-navy-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-saffron-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">न्य</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Nyayasaathi</h1>
              <p className="text-slate-400 text-xs">Legal Chat</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value)
                localStorage.setItem('preferredLanguage', e.target.value)
              }}
              className="bg-navy-700 text-white text-sm rounded-lg px-3 py-2 border border-slate-600"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
            <Link to="/dashboard" className="text-slate-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-accent-500 text-white rounded-br-md'
                    : 'bg-navy-800 text-slate-200 rounded-bl-md border border-slate-700'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-navy-800 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-700">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-6 border-t border-slate-700 bg-navy-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about Indian law..."
              className="flex-1 bg-navy-700 text-white placeholder-slate-400 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent-500"
              rows={1}
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/50 text-white px-6 py-3 rounded-xl transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-slate-500 text-xs mt-2 text-center">Press Enter to send • Ask about IPC, CrPC, Constitution, rights, procedures</p>
        </div>
      </div>
    </div>
  )
}

export default GeneralChat