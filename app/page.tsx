'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'

// Dynamically import Leaflet components to prevent SSR window errors
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false })
const Tooltip = dynamic(() => import('react-leaflet').then(m => m.Tooltip), { ssr: false })

interface Point {
  lat: number
  lon: number
  value: number
}

export default function Home() {
  const [points, setPoints] = useState<Point[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('Loading...')

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL)
      .then(res => res.json())
      .then(data => {
        setPoints(data.points || [])
        if (data.timestamp) {
          const t = new Date(data.timestamp * 1000)
          setLastUpdated(t.toLocaleString())
        } else {
          setLastUpdated(new Date().toLocaleString())
        }
      })
      .catch(err => {
        console.error(err)
        setLastUpdated('Failed to load data')
      })
  }, [])

  const getColor = (value: number) => {
    if (value < 10) return 'blue'
    if (value < 20) return 'green'
    if (value < 30) return 'yellow'
    if (value < 40) return 'orange'
    return 'red'
  }

  return (
    <div className="h-screen w-screen relative">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full bg-black bg-opacity-70 text-white p-4 z-[1000] flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg sm:text-xl font-semibold">MRMS Weather Radar Display (RALA)</h1>
        <div className="text-sm text-gray-300">
          Data Source: <a href="https://mrms.ncep.noaa.gov/" className="text-blue-400 underline" target="_blank">MRMS</a> |
          Last Updated: {lastUpdated}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[39, -98]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p, i) => (
          <CircleMarker
            key={i}
            center={[p.lat, p.lon]}
            radius={4}
            pathOptions={{ color: getColor(p.value) }}
          >
            <Tooltip>
              Reflectivity: {p.value} dBZ
              <br />
              Lat: {p.lat.toFixed(2)} | Lon: {p.lon.toFixed(2)}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-sm p-3 rounded-lg z-[1000]">
        <h2 className="font-semibold text-base mb-1">Reflectivity (dBZ)</h2>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-5 h-3 bg-blue-500 inline-block"></span> &lt; 10
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-5 h-3 bg-green-500 inline-block"></span> 10–20
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-5 h-3 bg-yellow-400 inline-block"></span> 20–30
        </div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-5 h-3 bg-orange-500 inline-block"></span> 30–40
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-3 bg-red-500 inline-block"></span> &gt; 40
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full text-center bg-black bg-opacity-70 text-gray-300 text-xs p-2 z-[1000]">
        Built by Varinder Singh | MRMS Radar Coding Challenge — Live Reflectivity at Lowest Altitude
      </div>
    </div>
  )
}
