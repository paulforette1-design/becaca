// ─── Utilisateurs ────────────────────────────────────────────────
export const mockUsers = [
  { id: 'u1', pseudo: 'Théo',    phone: '+33612345678', avatar: '🐻' },
  { id: 'u2', pseudo: 'Léa',     phone: '+33623456789', avatar: '🦊' },
  { id: 'u3', pseudo: 'Maxime',  phone: '+33634567890', avatar: '🐼' },
  { id: 'u4', pseudo: 'Camille', phone: '+33645678901', avatar: '🐨' },
  { id: 'u5', pseudo: 'Romain',  phone: '+33656789012', avatar: '🦁' },
]

// Utilisateur courant simulé (se connecte en tant que Théo)
export const mockCurrentUser = mockUsers[0]

// ─── Helpers date ─────────────────────────────────────────────────
const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const timeToday = (h, m) => {
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

// ─── Posts (10 posts sur 3 jours, coords GPS Paris) ───────────────
export const mockPosts = [
  // Aujourd'hui
  {
    id:           'p1',
    userId:       'u1',
    pseudo:       'Théo',
    avatar:       '🐻',
    createdAt:    timeToday(8, 14),
    locationType: 'home',
    coords:       { lat: 48.8566, lng: 2.3522 },
    photoBack:    null,   // null = placeholder couleur
    photoFront:   null,
  },
  {
    id:           'p2',
    userId:       'u2',
    pseudo:       'Léa',
    avatar:       '🦊',
    createdAt:    timeToday(9, 32),
    locationType: 'outdoor',
    coords:       { lat: 48.8606, lng: 2.3376 },
    photoBack:    null,
    photoFront:   null,
  },
  {
    id:           'p3',
    userId:       'u3',
    pseudo:       'Maxime',
    avatar:       '🐼',
    createdAt:    timeToday(11, 5),
    locationType: 'home',
    coords:       { lat: 48.8738, lng: 2.2950 },
    photoBack:    null,
    photoFront:   null,
  },
  {
    id:           'p4',
    userId:       'u4',
    pseudo:       'Camille',
    avatar:       '🐨',
    createdAt:    timeToday(13, 47),
    locationType: 'outdoor',
    coords:       { lat: 48.8490, lng: 2.3518 },
    photoBack:    null,
    photoFront:   null,
  },
  {
    id:           'p5',
    userId:       'u5',
    pseudo:       'Romain',
    avatar:       '🦁',
    createdAt:    timeToday(14, 22),
    locationType: 'home',
    coords:       { lat: 48.8650, lng: 2.3790 },
    photoBack:    null,
    photoFront:   null,
  },
  // Hier
  {
    id:           'p6',
    userId:       'u2',
    pseudo:       'Léa',
    avatar:       '🦊',
    createdAt:    daysAgo(1),
    locationType: 'outdoor',
    coords:       { lat: 48.8530, lng: 2.3499 },
    photoBack:    null,
    photoFront:   null,
  },
  {
    id:           'p7',
    userId:       'u1',
    pseudo:       'Théo',
    avatar:       '🐻',
    createdAt:    daysAgo(1),
    locationType: 'home',
    coords:       { lat: 48.8566, lng: 2.3522 },
    photoBack:    null,
    photoFront:   null,
  },
  // Il y a 2 jours
  {
    id:           'p8',
    userId:       'u3',
    pseudo:       'Maxime',
    avatar:       '🐼',
    createdAt:    daysAgo(2),
    locationType: 'home',
    coords:       { lat: 48.8738, lng: 2.2950 },
    photoBack:    null,
    photoFront:   null,
  },
  {
    id:           'p9',
    userId:       'u4',
    pseudo:       'Camille',
    avatar:       '🐨',
    createdAt:    daysAgo(2),
    locationType: 'outdoor',
    coords:       { lat: 48.8490, lng: 2.3518 },
    photoBack:    null,
    photoFront:   null,
  },
  {
    id:           'p10',
    userId:       'u5',
    pseudo:       'Romain',
    avatar:       '🦁',
    createdAt:    daysAgo(2),
    locationType: 'home',
    coords:       { lat: 48.8650, lng: 2.3790 },
    photoBack:    null,
    photoFront:   null,
  },
]

// ─── Posts filtrés aujourd'hui ────────────────────────────────────
const todayStr = () => new Date().toDateString()

export const getTodayPosts = () =>
  mockPosts.filter((p) => new Date(p.createdAt).toDateString() === todayStr())

// ─── Leaderboard calculé ─────────────────────────────────────────
import { computeUserScore } from './scoring.js'

export const getLeaderboard = () => {
  const scored = mockUsers.map((u) => ({
    ...u,
    score: computeUserScore(mockPosts, u.id),
    count: mockPosts.filter((p) => p.userId === u.id).length,
  }))
  return scored.sort((a, b) => b.score - a.score)
}
