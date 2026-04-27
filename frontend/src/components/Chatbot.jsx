import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

function Chatbot({ filename, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `नमस्ते! मैं आपका विधिक सहायक हूं। ${filename} के बारे में कोई भी सवाल पूछें और मैं आपकी मदद करूंगा।\n\nHello! I am your legal assistant. Ask me anything about ${filename} and I'll help you understand it.`
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [language, setLanguage] = useState(localStorage.getItem('preferredLanguage') || 'en')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const chatHistory = messages.map(({ role, content }) => ({ role, content }))

      const response = await axios.post('http://localhost:8000/chat', {
        filename,
        chat_history: chatHistory,
        question: userMessage.content,
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
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-navy-800 shadow-2xl animate-slide-in flex flex-col"
        style={{ height: '100vh', maxHeight: '100vh' }}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-saffron-500 to-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">न्य</span>
            </div>
            <div>
              <h2 className="text-white font-semibold">Nyayasaathi</h2>
              <p className="text-slate-400 text-xs">Document Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value)
                localStorage.setItem('preferredLanguage', e.target.value)
              }}
              className="bg-navy-700 text-white text-xs rounded px-2 py-1 border border-slate-600"
            >
              <option value="en">EN</option>
              <option value="hi">हिं</option>
            </select>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-saffron-500 to-orange-600 text-white rounded-br-md'
                    : 'bg-navy-700 text-slate-200 rounded-bl-md border border-slate-600'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-navy-700 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-600">
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

        <div className="p-4 border-t border-slate-700">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about your document..."
              className="flex-1 bg-navy-700 text-white placeholder-slate-400 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-saffron-500"
              rows={1}
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-gradient-to-r from-saffron-500 to-orange-600 hover:from-saffron-600 disabled:from-saffron-500/50 text-white px-4 py-3 rounded-xl transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chatbot