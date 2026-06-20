import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCamera } from '../hooks/useCamera.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useApp } from '../context/AppContext.jsx'
import { createPost } from '../api/postService.js'
import { getLocationTypeFromCoords } from '../api/locationService.js'

export default function CameraScreen() {
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const { addPost }  = useApp()

  const { openStreams, capture, stopStreams, isReady, error: camError } = useCamera()

  const backVideoRef  = useRef(null)
  const frontVideoRef = useRef(null)
  const [videosReady, setVideosReady] = useState(false)
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState(null)

  // Callback refs : déclenche videosReady dès que les deux <video> sont montés dans le DOM
  const setBackVideoRef = useCallback((el) => {
    backVideoRef.current = el
    if (el && frontVideoRef.current) setVideosReady(true)
  }, [])

  const setFrontVideoRef = useCallback((el) => {
    frontVideoRef.current = el
    if (el && backVideoRef.current) setVideosReady(true)
  }, [])

  // Ouvre les streams uniquement quand les deux éléments <video> sont dans le DOM
  useEffect(() => {
    if (!videosReady) return

    openStreams(backVideoRef.current, frontVideoRef.current)

    return () => {
      stopStreams()
    }
  }, [videosReady]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCapture = async () => {
    if (posting || !isReady) return
    setPosting(true)
    setPostError(null)

    try {
      // 1. Capture simultanée des deux flux
      const { photoBack, photoFront } = capture(backVideoRef.current, frontVideoRef.current)

      // 2. Géolocalisation + calcul home/outdoor
      let coords      = null
      let locationType = 'home'
      try {
        coords = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            reject,
            { timeout: 5000 }
          )
        })
        locationType = getLocationTypeFromCoords(coords, user?.homeCoords ?? null)
      } catch {
        // GPS refusé ou indisponible → home par défaut (1pt, comportement conservateur)
      }

      // 3. Création du post
      const newPost = await createPost({
        userId:      user?.id     ?? 'u1',
        pseudo:      user?.pseudo ?? 'Moi',
        avatar:      user?.avatar ?? '💩',
        locationType,
        coords,
        photoBack,
        photoFront,
      })

      addPost(newPost)

      // 4. Retour au feed avec message flash
      const msg = locationType === 'outdoor' ? '🌍 +2 pts ! BeCaca posté !' : '🏠 +1 pt ! BeCaca posté !'
      navigate('/feed', { replace: true, state: { flashMsg: msg } })

    } catch (err) {
      setPostError(err.message ?? 'Erreur lors de la publication. Réessaie.')
      setPosting(false)
    }
  }

  const handleClose = () => {
    stopStreams()
    navigate(-1)
  }

  const displayError = postError ?? camError

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden font-nunito">

      {/* Caméra arrière — plein écran en fond */}
      <video
        ref={setBackVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Caméra frontale — incrustation en haut à droite (style BeReal) */}
      <div className="absolute top-4 right-4 w-[30%] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white shadow-xl z-10">
        <video
          ref={setFrontVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
      </div>

      {/* Overlay d'erreur (caméras refusées / indisponibles) */}
      {displayError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 z-20 px-8 text-center">
          <span className="text-6xl mb-4">📵</span>
          <p className="text-white text-lg font-bold mb-2">Caméra indisponible</p>
          <p className="text-white/70 text-sm mb-8">{displayError}</p>
          <button
            onClick={handleClose}
            className="bg-white text-caca-primary font-bold px-8 py-3 rounded-full text-base"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Bouton fermer ✕ — haut gauche */}
      {!displayError && (
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white text-lg font-bold z-20"
          aria-label="Fermer la caméra"
        >
          ✕
        </button>
      )}

      {/* Indicateur de chargement des streams */}
      {!displayError && !isReady && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20">
          <p className="text-white/70 text-sm font-semibold">Ouverture de la caméra…</p>
        </div>
      )}

      {/* Bouton de capture — grand cercle blanc centré en bas */}
      {!displayError && (
        <button
          onClick={handleCapture}
          disabled={posting || !isReady}
          className={`
            absolute bottom-12 left-1/2 -translate-x-1/2 z-20
            w-20 h-20 rounded-full bg-white
            flex items-center justify-center text-4xl
            shadow-2xl transition-transform active:scale-90
            ${posting || !isReady ? 'opacity-40 cursor-not-allowed' : 'opacity-100'}
          `}
          aria-label="Prendre un BeCaca"
        >
          {posting ? '⏳' : '💩'}
        </button>
      )}

      {/* Anneau extérieur du bouton de capture */}
      {!displayError && !posting && isReady && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white/50 z-10 pointer-events-none" />
      )}
    </div>
  )
}
