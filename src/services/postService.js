import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase.js'
import { getPostScore } from '../utils/scoring.js'

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Convertit un data URL base64 (canvas.toDataURL) en Blob,
 * puis uploade vers Firebase Storage.
 * Retourne l'URL publique de téléchargement, ou null si dataUrl est null.
 */
async function uploadPhoto(uid, timestamp, slot, dataUrl) {
  if (!dataUrl) return null
  try {
    const response = await fetch(dataUrl)
    const blob     = await response.blob()
    const path     = `posts/${uid}/${timestamp}_${slot}.jpg`
    const fileRef  = ref(storage, path)
    await uploadBytes(fileRef, blob, { contentType: 'image/jpeg' })
    return await getDownloadURL(fileRef)
  } catch (_err) {
    throw new Error(`Upload photo ${slot} échoué. Vérifie ta connexion.`)
  }
}

/**
 * Sérialise un document Firestore post en objet JS compatible UI.
 * Convertit le Timestamp Firestore en ISO string pour les composants.
 */
function serializePost(docSnap) {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString(),
  }
}

// ─── API publique ─────────────────────────────────────────────────

/**
 * Retourne tous les posts créés depuis minuit (heure locale),
 * triés du plus récent au plus ancien.
 */
export const fetchTodayPosts = async () => {
  try {
    const midnight = new Date()
    midnight.setHours(0, 0, 0, 0)

    const q = query(
      collection(db, 'posts'),
      where('createdAt', '>=', Timestamp.fromDate(midnight)),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(serializePost)
  } catch (err) {
    if (err.code === 'permission-denied') {
      throw new Error('Accès refusé. Vérifie les règles Firestore.')
    }
    throw new Error('Impossible de charger le feed. Vérifie ta connexion.')
  }
}

/**
 * Retourne tous les posts d'un utilisateur (historique complet),
 * triés du plus récent au plus ancien.
 */
export const fetchUserPosts = async (userId) => {
  try {
    const q = query(
      collection(db, 'posts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(serializePost)
  } catch (err) {
    if (err.code === 'permission-denied') {
      throw new Error('Accès refusé. Vérifie les règles Firestore.')
    }
    throw new Error('Impossible de charger tes posts.')
  }
}

/**
 * Publie un BeCaca :
 *   1. Upload des deux photos (back + front) dans Storage
 *   2. Écriture du document dans collection 'posts'
 *   3. Mise à jour atomique du score et du compteur dans 'users'
 */
export const createPost = async ({
  userId,
  pseudo,
  avatar,
  locationType,
  coords,
  photoBack,
  photoFront,
}) => {
  const timestamp = Date.now()
  const points    = getPostScore(locationType)

  // 1. Upload des photos (en parallèle)
  const [photoBackUrl, photoFrontUrl] = await Promise.all([
    uploadPhoto(userId, timestamp, 'back', photoBack),
    uploadPhoto(userId, timestamp, 'front', photoFront),
  ])

  // 2. Écriture du post dans Firestore
  let docRef
  try {
    docRef = await addDoc(collection(db, 'posts'), {
      userId,
      pseudo,
      avatar:       avatar ?? '💩',
      locationType,
      coords:       coords ?? null,
      photoBack:    photoBackUrl,
      photoFront:   photoFrontUrl,
      points,
      createdAt:    serverTimestamp(),
    })
  } catch (_err) {
    throw new Error('Erreur lors de la publication du BeCaca.')
  }

  // 3. Mise à jour score + count utilisateur
  try {
    await updateDoc(doc(db, 'users', userId), {
      score:     increment(points),
      count:     increment(1),
      lastPostAt: serverTimestamp(),
    })
  } catch (_err) {
    // Non bloquant : le post existe, on log sans planter l'UI
    console.warn('[postService] Mise à jour score utilisateur échouée:', _err)
  }

  // Retourne le post sérialisé (compatible avec les composants UI)
  return {
    id: docRef.id,
    userId,
    pseudo,
    avatar:      avatar ?? '💩',
    locationType,
    coords:      coords ?? null,
    photoBack:   photoBackUrl,
    photoFront:  photoFrontUrl,
    points,
    createdAt:   new Date().toISOString(),
  }
}
