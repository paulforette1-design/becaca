import { useState, useEffect } from 'react'

export const useGeolocation = (autoFetch = false) => {
  const [coords, setCoords]     = useState(null)
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée par ce navigateur.')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLoading(false)
      },
      (err) => {
        setError(err.code === 1
          ? 'Accès à la localisation refusé. Active-le dans les réglages.'
          : 'Impossible de te localiser.')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    )
  }

  useEffect(() => {
    if (autoFetch) getLocation()
  }, [autoFetch])

  return { coords, error, loading, getLocation }
}
