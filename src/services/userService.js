import { doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase.js'

/**
 * Géocode une adresse via Nominatim (même helper que authService).
 */
const geocodeAddress = async (address) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
    { headers: { 'User-Agent': 'BeCaca-App/1.0', Accept: 'application/json' } }
  )
  const results = await res.json()
  if (!results?.length) {
    const err = new Error('ADDRESS_NOT_FOUND')
    err.message = 'ADDRESS_NOT_FOUND'
    throw err
  }
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) }
}

/**
 * Met à jour le pseudo de l'utilisateur dans Firestore.
 */
export const updatePseudo = async (uid, pseudo) => {
  if (!pseudo?.trim()) throw new Error('Le pseudo ne peut pas être vide.')
  await updateDoc(doc(db, 'users', uid), { pseudo: pseudo.trim() })
  return { pseudo: pseudo.trim() }
}

/**
 * Met à jour l'adresse domicile : géocode d'abord, puis sauvegarde dans Firestore.
 */
export const updateAddress = async (uid, address) => {
  if (!address?.trim()) throw new Error("L'adresse ne peut pas être vide.")
  const homeCoords = await geocodeAddress(address.trim())
  await updateDoc(doc(db, 'users', uid), {
    homeAddress: address.trim(),
    homeCoords,
  })
  return { homeAddress: address.trim(), homeCoords }
}

/**
 * Upload une photo de profil dans Firebase Storage et sauvegarde l'URL dans Firestore.
 * @param {string} uid
 * @param {File} file  Fichier image sélectionné par l'utilisateur
 */
export const updateProfilePhoto = async (uid, file) => {
  // Resize côté client via canvas pour limiter la taille (max 400x400)
  const resized = await resizeImage(file, 400)
  const storageRef = ref(storage, `avatars/${uid}/profile.jpg`)
  await uploadBytes(storageRef, resized, { contentType: 'image/jpeg' })
  const photoURL = await getDownloadURL(storageRef)
  await updateDoc(doc(db, 'users', uid), { photoURL })
  return { photoURL }
}

/**
 * Redimensionne une image via canvas (max largeur/hauteur = maxSize).
 * Retourne un Blob JPEG.
 */
const resizeImage = (file, maxSize) =>
  new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale  = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85)
    }
    img.src = url
  })
