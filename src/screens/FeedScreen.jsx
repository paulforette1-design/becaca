import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { fetchTodayPosts } from '../api/postService.js'
import PostCard from '../components/PostCard.jsx'
import SkeletonLoader from '../components/SkeletonLoader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import BeCacaButton from '../components/BeCacaButton.jsx'

export default function FeedScreen() {
  const { posts, loadingPosts, error, setPosts, setLoadingPost, setPostError } = useApp()
  const location = useLocation()
  const [flashMsg, setFlashMsg] = useState(location.state?.flashMsg ?? null)

  useEffect(() => {
    setLoadingPost()
    fetchTodayPosts()
      .then(setPosts)
      .catch((e) => setPostError(e.message))
  }, [])

  // Efface le flash après 2.5s
  useEffect(() => {
    if (!flashMsg) return
    const t = setTimeout(() => setFlashMsg(null), 2500)
    return () => clearTimeout(t)
  }, [flashMsg])

  return (
    <div className="min-h-screen bg-caca-bg font-nunito">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-caca-bg/95 backdrop-blur px-4 py-4 flex items-center justify-between border-b border-caca-surface">
        <div>
          <h1 className="text-2xl font-black text-caca-primary">BeCaca</h1>
          <p className="text-xs text-caca-muted">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <span className="text-3xl">💩</span>
      </header>

      {/* Contenu */}
      <main className="pb-28 pt-4">
        {loadingPosts && <SkeletonLoader count={3} />}

        {!loadingPosts && error && (
          <EmptyState icon="⚠️" title="Erreur" message={error} />
        )}

        {!loadingPosts && !error && posts.length === 0 && (
          <EmptyState
            title="Personne n'a encore cacat aujourd'hui"
            message="Sois le premier ! Appuie sur 💩 pour poster ton BeCaca."
          />
        )}

        {!loadingPosts && !error && posts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} />
        ))}
      </main>

      {/* BeCacaButton centré au-dessus de la BottomNav */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
        <BeCacaButton />
      </div>

      {/* Flash message post-capture */}
      {flashMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 whitespace-nowrap bg-caca-dark text-white text-sm font-nunito font-semibold px-5 py-2.5 rounded-full shadow-lg z-50 animate-bounce">
          {flashMsg}
        </div>
      )}
    </div>
  )
}
