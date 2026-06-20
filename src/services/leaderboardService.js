import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from './firebase.js'

/**
 * Retourne le classement complet des utilisateurs,
 * trié par score décroissant.
 * Chaque entrée expose : id, pseudo, avatar, score, count.
 */
export const fetchLeaderboard = async () => {
  try {
    const q    = query(collection(db, 'users'), orderBy('score', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
  } catch (err) {
    if (err.code === 'permission-denied') {
      throw new Error('Accès refusé. Vérifie les règles Firestore.')
    }
    throw new Error('Impossible de charger le classement. Vérifie ta connexion.')
  }
}
