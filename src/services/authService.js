import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from './firebase.js'

const AVATARS = ['🐻', '🦊', '🐼', '🐨', '🦁', '🐯', '🦄', '🐸', '🐺', '🦋']
const randomAvatar = () => AVATARS[Math.floor(Math.random() * AVATARS.length)]

/**
 * Géocode une adresse via OpenStreetMap Nominatim (gratuit, sans clé API).
 * Lance une erreur avec code 'ADDRESS_NOT_FOUND' si l'adresse est introuvable.
 *
 * @param {string} address  Adresse en texte libre (ex: "12 rue de Rivoli, Paris")
 * @returns {Promise<{ lat: number, lng: number }>}
 */
const geocodeAddress = async (address) => {
  const encoded = encodeURIComponent(address)
  const url     = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'BeCaca-App/1.0',
      'Accept':     'application/json',
    },
  })

  if (!res.ok) {
    const err = new Error('ADDRESS_NOT_FOUND')
    err.message = 'ADDRESS_NOT_FOUND'
    throw err
  }

  const results = await res.json()

  if (!results || results.length === 0) {
    const err = new Error('ADDRESS_NOT_FOUND')
    err.message = 'ADDRESS_NOT_FOUND'
    throw err
  }

  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
  }
}

/**
 * Crée un compte : email + mot de passe + pseudo + adresse → Firebase Auth + Firestore.
 * Géocode l'adresse via Nominatim avant de créer le compte.
 * Échoue avec message 'ADDRESS_NOT_FOUND' si l'adresse est introuvable.
 */
export const createAccount = async ({ email, password, pseudo, address }) => {
  // Géocodage AVANT la création du compte pour fail fast si l'adresse est mauvaise
  const homeCoords = await geocodeAddress(address)

  const cred   = await createUserWithEmailAndPassword(auth, email, password)
  const uid    = cred.user.uid
  const avatar = randomAvatar()

  await setDoc(doc(db, 'users', uid), {
    pseudo,
    avatar,
    score:       0,
    count:       0,
    homeAddress: address,
    homeCoords,
    createdAt:   serverTimestamp(),
    lastPostAt:  null,
  })

  return { id: uid, uid, pseudo, avatar, score: 0, count: 0, homeAddress: address, homeCoords }
}

/**
 * Connexion d'un compte existant (email + mot de passe).
 * Inclut homeCoords et homeAddress depuis Firestore.
 */
export const signIn = async ({ email, password }) => {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const snap = await getDoc(doc(db, 'users', cred.user.uid))
  if (!snap.exists()) throw new Error('Compte introuvable.')
  return { id: cred.user.uid, uid: cred.user.uid, ...snap.data() }
}

/**
 * Déconnecte l'utilisateur.
 */
export const logout = async () => {
  await signOut(auth)
  return { success: true }
}

/**
 * Restaure la session Firebase après rechargement de page.
 * Inclut homeCoords et homeAddress depuis Firestore.
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) { callback(null); return }
    try {
      const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (snap.exists()) {
        // Firestore retourne homeCoords et homeAddress automatiquement via spread
        callback({ id: firebaseUser.uid, uid: firebaseUser.uid, ...snap.data() })
      } else {
        callback(null)
      }
    } catch (_) {
      callback(null)
    }
  })
}

