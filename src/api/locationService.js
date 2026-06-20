/**
 * Calcule la distance en mètres entre deux points GPS (formule de Haversine).
 * @param {{ lat: number, lng: number }} coords1
 * @param {{ lat: number, lng: number }} coords2
 * @returns {number} Distance en mètres
 */
export const haversineDistance = (coords1, coords2) => {
  const R    = 6371000 // rayon moyen de la Terre en mètres
  const toRad = (deg) => (deg * Math.PI) / 180

  const dLat = toRad(coords2.lat - coords1.lat)
  const dLng = toRad(coords2.lng - coords1.lng)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coords1.lat)) *
    Math.cos(toRad(coords2.lat)) *
    Math.sin(dLng / 2) ** 2

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Retourne le type de lieu selon la distance au domicile.
 *
 * Barème :
 *   < 200 m  → 'home'    (1 pt) — inclut la zone 100–200 m, traitée de façon conservatrice
 *   > 200 m  → 'outdoor' (2 pts)
 *
 * @param {{ lat: number, lng: number } | null} currentCoords  Position actuelle
 * @param {{ lat: number, lng: number } | null} homeCoords     Domicile enregistré
 * @returns {'home' | 'outdoor'}
 */
export const getLocationTypeFromCoords = (currentCoords, homeCoords) => {
  if (!currentCoords || !homeCoords) return 'home' // fallback sécuritaire
  const dist = haversineDistance(currentCoords, homeCoords)
  return dist > 200 ? 'outdoor' : 'home'
}

/**
 * Obtient les coordonnées GPS actuelles via l'API native.
 * @returns {Promise<{ lat: number, lng: number }>}
 */
export const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Géolocalisation non supportée'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('Localisation refusée')),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  })
