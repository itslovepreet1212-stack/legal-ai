import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Upload from './pages/Upload'
import Analysis from './pages/Analysis'
import Lawyers from './pages/Lawyers'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Chat from './pages/Chat'

function App() {
  const [analysisData, setAnalysisData] = useState(null)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Upload setAnalysisData={setAnalysisData} />} />
        <Route path="/analysis" element={<Analysis analysisData={analysisData} setAnalysisData={setAnalysisData} />} />
        <Route path="/lawyers" element={<Lawyers analysisData={analysisData} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App