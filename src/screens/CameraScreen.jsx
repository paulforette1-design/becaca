import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCamera } from '../hooks/useCamera.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useApp } from '../context/AppContext.jsx'
import { createPost } from '../api/postService.js'
import { getLocationTypeFromCoords } from '../api/locationService.js'

export default function CameraScreen() {
  const navigate    = useNavigate()
  const { user }    = useAuth()
  const { addPost } = useApp()

  const { openBackCamera, capture, stopStreams, isReady, isCapturing, error: camError } = useCamera()

  const backVideoRef = useRef(null)
  const [posting,    setPosting]    = useState(false)
  const [postError,  setPostError]  = useState(null)
  const [phase,      setPhase]      = useState('back') // 'back' | 'front' | 'uploading'

  // Callback ref : ouvre la caméra arrière dès que l'élément <video> est monté
  const setBackVideoRef = useCallback((el) => {
    backVideoRef.current = el
    if (el) openBackCamera(el)
  }, [openBackCamera])

  // Cleanup au démontage
  useEffect(() => () => stopStreams(), [stopStreams])

  const handleCapture = async () => {
    if (posting || !isReady) return
    setPosting(true)
    setPostError(null)
    setPhase('front') // passe en phase "capture caméra avant"

    try {
      // 1. Capture séquentielle (arrière puis avant)
      const { photoBack, photoFront } = await capture(backVideoRef.current)

      setPhase('uploading')

      // 2. Géolocalisation
      let coords       = null
      let locationType = 'home'
      try {
        coords = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            reject,
            { timeout: 5000 }
          )
        )
        locationType = getLocationTypeFromCoords(coords, user?.homeCoords ?? null)
      } catch {
        // GPS refusé → home par défaut
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

      const msg = locationType === 'outdoor'
        ? '🌍 +2 pts ! BeCaca posté !'
        : '🏠 +1 pt ! BeCaca posté !'
      navigate('/feed', { replace: true, state: { flashMsg: msg } })

    } catch (err) {
      setPostError(err.message ?? 'Erreur lors de la publication. Réessaie.')
      setPosting(false)
      setPhase('back')
    }
  }

  const handleClose = () => {
    stopStreams()
    navigate(-1)
  }

  const displayError = postError ?? camError

  // Labels des phases de capture
  const phaseLabel = {
    back:      null,
    front:     '📸 Selfie en cours…',
    uploading: '⬆️ Publication…',
  }[phase]

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden font-nunito">

      {/* Caméra arrière — plein écran (réutilisé brièvement pour le selfie lors de la capture) */}
      <video
        ref={setBackVideoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          phase === 'front' ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Overlay de phase "selfie en cours" */}
      {phase === 'front' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
          <div className="text-8xl mb-4 animate-bounce">🤳</div>
          <p className="text-white text-lg font-bold">Selfie en cours…</p>
          <p className="text-white/50 text-sm mt-1">Ne bouge pas !</p>
        </div>
      )}

      {/* Overlay upload */}
      {phase === 'uploading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
          <div className="text-8xl mb-4">⬆️</div>
          <p className="text-white text-lg font-bold">Publication…</p>
        </div>
      )}

      {/* Incrustation caméra avant — placeholder (indique qu'elle sera capturée) */}
      {phase === 'back' && !displayError && (
        <div className="absolute top-4 right-4 w-[30%] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white shadow-xl z-10 bg-black/60 flex items-center justify-center">
          <span className="text-3xl">🤳</span>
        </div>
      )}

      {/* Overlay erreur */}
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

      {/* Bouton fermer */}
      {!displayError && phase === 'back' && (
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white text-lg font-bold z-20"
          aria-label="Fermer la caméra"
        >
          ✕
        </button>
      )}

      {/* Indicateur chargement viewfinder */}
      {!displayError && !isReady && phase === 'back' && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20">
          <p className="text-white/70 text-sm font-semibold">Ouverture de la caméra…</p>
        </div>
      )}

      {/* Bouton de capture */}
      {!displayError && phase === 'back' && (
        <>
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
            💩
          </button>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white/50 z-10 pointer-events-none" />
        </>
      )}
    </div>
  )
}
