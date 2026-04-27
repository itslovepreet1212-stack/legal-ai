import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Upload({ setAnalysisData }) {
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadType, setUploadType] = useState('document')
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const validateAndSetFile = (selectedFile) => {
    const extension = selectedFile.name.split('.').pop().toLowerCase()
    const allowedTypes = uploadType === 'image'
      ? ['jpg', 'jpeg', 'png', 'webp', 'bmp']
      : ['pdf', 'docx', 'doc']

    if (!allowedTypes.includes(extension)) {
      setError(`Please upload a ${uploadType === 'image' ? 'image' : 'PDF or DOCX'} file only.`)
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.')
      return
    }
    setFile(selectedFile)
    setError('')
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.')
      return
    }

    setIsLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('language', localStorage.getItem('preferredLanguage') || 'en')

    const endpoint = uploadType === 'image' ? '/upload-image' : '/upload'

    try {
      const response = await axios.post(`http://localhost:8000${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000,
      })

      const data = response.data
      if (data.status === 'success') {
        const filename = data.filename || data.original_filename
        setAnalysisData({ ...data, filename })
        localStorage.setItem('analysisData', JSON.stringify({ ...data, filename }))
        localStorage.setItem('filename', filename)
        navigate('/analysis')
      } else {
        setError('Upload failed. Please try again.')
      }
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else if (err.code === 'ECONNABORTED') {
        setError('Upload timed out. Please try again with a smaller file.')
      } else {
        setError('Failed to upload. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy-900">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-saffron-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-saffron-500/20">
              <span className="text-white font-bold text-3xl">न्य</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Nyayasaathi</h1>
          <p className="text-slate-400 text-lg">न्यायसाथी • Your Justice Companion</p>
          <p className="text-slate-500 text-sm mt-1">AI-powered Indian Legal Assistant</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setUploadType('document'); setFile(null) }}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              uploadType === 'document'
                ? 'bg-accent-500 text-white'
                : 'bg-navy-800 text-slate-400 hover:bg-navy-700'
            }`}
          >
            📄 Document
          </button>
          <button
            onClick={() => { setUploadType('image'); setFile(null) }}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              uploadType === 'image'
                ? 'bg-accent-500 text-white'
                : 'bg-navy-800 text-slate-400 hover:bg-navy-700'
            }`}
          >
            📷 Image
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
            isDragging
              ? 'border-accent-500 bg-accent-500/10'
              : 'border-slate-600 hover:border-slate-500 bg-navy-800/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={uploadType === 'image' ? '.jpg,.jpeg,.png,.webp,.bmp' : '.pdf,.docx,.doc'}
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <div className="animate-fade-in">
              <div className="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-white text-lg font-medium mb-2">{file.name}</p>
              <p className="text-slate-400 text-sm mb-6">{(file.size / 1024).toFixed(1)} KB</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-accent-500 hover:text-accent-400 text-sm font-medium"
              >
                Choose a different file
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-center w-16 h-16 bg-slate-700 rounded-full mx-auto mb-4">
                {uploadType === 'image' ? (
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
              </div>
              <p className="text-white text-lg font-medium mb-2">
                {uploadType === 'image' ? 'Upload legal document image' : 'Drop your legal document here'}
              </p>
              <p className="text-slate-400 text-sm mb-6">or click to browse</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Select File
              </button>
              <p className="text-slate-500 text-xs mt-4">
                {uploadType === 'image'
                  ? 'Supports JPG, PNG, WEBP, BMP up to 10MB'
                  : 'Supports PDF and DOCX files up to 10MB'}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-fade-in">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {file && (
          <button
            onClick={handleUpload}
            disabled={isLoading}
            className="mt-6 w-full bg-accent-500 hover:bg-accent-600 disabled:bg-accent-500/50 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing Document...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analyze Document
              </>
            )}
          </button>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-navy-800 rounded-xl">
            <div className="text-saffron-500 text-2xl mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-slate-300 text-sm">Risk Analysis</p>
          </div>
          <div className="p-4 bg-navy-800 rounded-xl">
            <div className="text-green-500 text-2xl mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-slate-300 text-sm">AI Chat</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/dashboard" className="text-accent-500 hover:text-accent-400 text-sm font-medium">
            Go to Dashboard →
          </a>
        </div>
      </div>
    </div>
  )
}

export default Upload