import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchUserPosts } from '../api/postService.js'
import { logout } from '../api/authService.js'
import { computeUserScore } from '../utils/scoring.js'
import { getLocationLabel } from '../utils/scoring.js'
import SkeletonLoader from '../components/SkeletonLoader.jsx'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function ProfileScreen() {
  const { user, logout: authLogout } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserPosts(user?.id ?? 'u1')
      .then((data) => { setPosts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user])

  const score = computeUserScore(posts, user?.id ?? 'u1')

  const handleLogout = async () => {
    await logout()
    authLogout()
    navigate('/onboarding')
  }

  return (
    <div className="min-h-screen bg-caca-bg font-nunito pb-20">
      {/* Header profil */}
      <div className="bg-caca-primary text-white px-6 pt-10 pb-8 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-5xl">
          {user?.avatar ?? '💩'}
        </div>
        <h2 className="text-2xl font-black">{user?.pseudo ?? 'Anonyme'}</h2>
        <div className="flex gap-6 mt-2">
          <div className="text-center">
            <p className="text-3xl font-black">{score}</p>
            <p className="text-xs text-white/70">points</p>
          </div>
          <div className="w-px bg-white/20" />
          <div className="text-center">
            <p className="text-3xl font-black">{posts.length}</p>
            <p className="text-xs text-white/70">cacas</p>
          </div>
        </div>
      </div>

      {/* Historique */}
      <div className="px-4 pt-6">
        <h3 className="font-bold text-caca-text mb-4">Mon historique 📋</h3>

        {loading && <SkeletonLoader count={3} />}

        {!loading && posts.length === 0 && (
          <p className="text-caca-muted text-sm text-center py-8">Aucun BeCaca pour l'instant. Lance-toi !</p>
        )}

        {!loading && posts.map((post) => (
          <div key={post.id} className="bg-white rounded-2xl px-4 py-3 mb-3 flex items-center gap-3 shadow-sm">
            <span className="text-2xl">{post.locationType === 'outdoor' ? '🌍' : '🏠'}</span>
            <div className="flex-1">
              <p className="font-semibold text-caca-text text-sm">{getLocationLabel(post.locationType)}</p>
              <p className="text-xs text-caca-muted">{formatDate(post.createdAt)}</p>
            </div>
            <span className="font-bold text-caca-accent">
              +{post.locationType === 'outdoor' ? 2 : 1} pt
            </span>
          </div>
        ))}
      </div>

      {/* Déconnexion */}
      <div className="px-4 mt-6">
        <button
          onClick={handleLogout}
          className="w-full border-2 border-caca-primary text-caca-primary font-bold py-3 rounded-full hover:bg-caca-primary hover:text-white transition"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
