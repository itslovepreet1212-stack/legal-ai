import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import LawyerCard from '../components/LawyerCard'

function Lawyers({ analysisData }) {
  const [lawyers, setLawyers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [locationRequested, setLocationRequested] = useState(false)
  const [error, setError] = useState('')
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!analysisData) {
      const stored = localStorage.getItem('analysisData')
      if (stored) {
        const data = JSON.parse(stored)
        fetchLawyers(data.filename)
      } else {
        navigate('/')
      }
    } else {
      fetchLawyers(analysisData.filename)
    }
  }, [analysisData, navigate])

  const fetchLawyers = async (filename) => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    setIsLoading(true)
    setLocationRequested(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const response = await fetch(
            `http://localhost:8000/lawyers?filename=${encodeURIComponent(filename)}&latitude=${latitude}&longitude=${longitude}`
          )

          if (!response.ok) {
            throw new Error('Failed to fetch lawyers')
          }

          const data = await response.json()
          setLawyers(data)
          // map initialization will be handled in the effect below once lawyers data is loaded
        } catch (err) {
          setError('Failed to find nearby lawyers. Please try again.')
        } finally {
          setIsLoading(false)
        }
      },
      (err) => {
        setError('Unable to get your location. Please enable location services.')
        setIsLoading(false)
      }
    )
  }

  const initMap = (lat, lng, lawyersList) => {
    if (!mapRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.off()
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapRef.current).setView([lat, lng], 12)
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const userMarker = L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: '#3b82f6',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 1,
    }).addTo(map)
    userMarker.bindPopup('Your location').openPopup()

    const markers = []
    lawyersList.forEach((lawyer) => {
      if (!lawyer.location?.lat || !lawyer.location?.lng) return

      const marker = L.marker([lawyer.location.lat, lawyer.location.lng]).addTo(map)
      marker.bindPopup(`
        <div style="padding: 10px; max-width: 230px;">
          <strong style="font-size: 14px;">${lawyer.name}</strong>
          <p style="margin: 8px 0 0 0; color: #333; font-size: 13px;">${lawyer.address}</p>
          <p style="margin: 8px 0 0 0; color: #333; font-size: 13px;">${lawyer.phone}</p>
        </div>
      `)
      markers.push([lawyer.location.lat, lawyer.location.lng])
    })

    const bounds = L.latLngBounds([[lat, lng], ...markers])
    if (markers.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }

  useEffect(() => {
    if (lawyers.length === 0) return

    const initMapWithFallback = (lawyersList) => {
      if (!mapRef.current) return

      const doInit = (lat, lng) => initMap(lat, lng, lawyersList)

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => doInit(position.coords.latitude, position.coords.longitude),
          () => {
            const first = lawyersList[0]
            if (first?.location?.lat && first?.location?.lng) {
              doInit(first.location.lat, first.location.lng)
            } else {
              doInit(37.7749, -122.4194)
            }
          }
        )
      } else {
        const first = lawyersList[0]
        if (first?.location?.lat && first?.location?.lng) {
          doInit(first.location.lat, first.location.lng)
        } else {
          doInit(37.7749, -122.4194)
        }
      }
    }

    initMapWithFallback(lawyers)
  }, [lawyers])

  if (!analysisData && !localStorage.getItem('analysisData')) {
    return null
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <div className="max-w-7xl mx-auto p-6">
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
            <h1 className="text-2xl font-bold text-white">Find Nearby Lawyers</h1>
            <p className="text-slate-400 text-sm">Powered by Nyayasaathi</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full mb-4" />
            <p className="text-slate-400">Finding lawyers near you...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {!isLoading && !error && lawyers.length === 0 && locationRequested && (
          <div className="bg-navy-800 rounded-xl p-8 text-center">
            <svg className="w-16 h-16 text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-400 text-lg">No lawyers found nearby</p>
            <p className="text-slate-500 text-sm mt-2">Try a different location or upload a different document type</p>
          </div>
        )}

        {!isLoading && lawyers.length > 0 && (
          <>
            <div
              ref={mapRef}
              className="w-full h-80 rounded-xl mb-8"
              style={{ borderRadius: '12px', overflow: 'hidden' }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lawyers.map((lawyer, index) => (
                <LawyerCard key={index} lawyer={lawyer} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Lawyers