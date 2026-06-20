import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useApp } from '../context/AppContext.jsx'
import { fetchTodayPosts } from '../api/postService.js'
import { createCacaIcon } from '../components/MapPin.jsx'
import EmptyState from '../components/EmptyState.jsx'
import SkeletonLoader from '../components/SkeletonLoader.jsx'
import 'leaflet/dist/leaflet.css'

const PARIS = [48.8566, 2.3522]

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function MapScreen() {
  const { posts, loadingPosts, error, setPosts, setLoadingPost, setPostError } = useApp()

  useEffect(() => {
    if (posts.length === 0) {
      setLoadingPost()
      fetchTodayPosts()
        .then(setPosts)
        .catch((e) => setPostError(e.message))
    }
  }, [])

  const geolocated = posts.filter((p) => p.coords)

  return (
    <div className="min-h-screen bg-caca-bg font-nunito flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 border-b border-caca-surface bg-caca-bg">
        <h1 className="text-xl font-black text-caca-primary">Carte du jour 🗺️</h1>
        <p className="text-xs text-caca-muted">Réinitialisée à minuit • {geolocated.length} caca{geolocated.length > 1 ? 's' : ''} épinglé{geolocated.length > 1 ? 's' : ''}</p>
      </header>

      {loadingPosts && <SkeletonLoader count={1} />}

      {!loadingPosts && error && (
        <EmptyState icon="⚠️" title="Erreur" message={error} />
      )}

      {!loadingPosts && !error && geolocated.length === 0 && (
        <EmptyState
          title="Aucun caca géolocalisé"
          message="Poste ton premier BeCaca pour apparaître sur la carte !"
        />
      )}

      {!loadingPosts && !error && geolocated.length > 0 && (
        <div className="flex-1 pb-16">
          <MapContainer
            center={PARIS}
            zoom={13}
            style={{ height: 'calc(100vh - 130px)', width: '100%' }}
            zoomControl={false}
          >
            {/* Tuiles thème chaud (CartoDB Voyager) */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

            {geolocated.map((post) => (
              <Marker
                key={post.id}
                position={[post.coords.lat, post.coords.lng]}
                icon={createCacaIcon()}
              >
                <Popup>
                  <div className="font-nunito text-center">
                    <span className="text-2xl">{post.avatar}</span>
                    <p className="font-bold text-caca-text">{post.pseudo}</p>
                    <p className="text-caca-muted text-xs">{formatTime(post.createdAt)}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold text-white ${
                      post.locationType === 'outdoor' ? 'bg-green-600' : 'bg-caca-primary'
                    }`}>
                      {post.locationType === 'outdoor' ? '🌍 Dehors +2pts' : '🏠 Maison +1pt'}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  )
}
