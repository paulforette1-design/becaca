import { useState, useRef, useCallback } from 'react'

/**
 * Caméra séquentielle (compatible iOS Safari).
 *
 * iOS n'autorise qu'un seul flux caméra actif à la fois.
 * Solution : viewfinder = caméra arrière uniquement.
 * À la capture : snap arrière → bascule caméra avant → snap avant.
 *
 * Usage :
 *   openBackCamera(backVideoEl)  → démarre le viewfinder
 *   capture(backVideoEl)         → snap arrière + snap avant séquentiels
 *   stopStreams()                → cleanup
 */
export const useCamera = () => {
  const [isReady,  setIsReady]  = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [error,    setError]    = useState(null)
  const backStreamRef  = useRef(null)
  const frontStreamRef = useRef(null)

  // ─── Helpers ──────────────────────────────────────────────────

  const openStream = async (facingMode) => {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width:  { ideal: facingMode === 'environment' ? 1280 : 640 },
          height: { ideal: facingMode === 'environment' ? 720  : 480 },
        },
        audio: false,
      })
    } catch {
      return null
    }
  }

  const stopStream = (streamRef) => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  /**
   * Capture un frame depuis un élément <video> via canvas.
   * mirror = true → flip horizontal (caméra frontale)
   */
  const captureFrame = (videoEl, mirror = false) => {
    if (!videoEl || !videoEl.videoWidth) return null
    const canvas  = document.createElement('canvas')
    canvas.width  = videoEl.videoWidth
    canvas.height = videoEl.videoHeight
    const ctx = canvas.getContext('2d')
    if (mirror) {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(videoEl, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.85)
  }

  /**
   * Attend qu'un élément <video> ait reçu des données vidéo.
   */
  const waitForVideo = (videoEl, timeoutMs = 3000) =>
    new Promise((resolve) => {
      if (videoEl.readyState >= 2) { resolve(); return }
      const onReady = () => { videoEl.removeEventListener('canplay', onReady); resolve() }
      videoEl.addEventListener('canplay', onReady)
      setTimeout(resolve, timeoutMs) // fallback timeout
    })

  // ─── API publique ──────────────────────────────────────────────

  /**
   * Ouvre uniquement la caméra ARRIÈRE pour le viewfinder.
   * Compatible iOS (un seul flux actif).
   */
  const openBackCamera = useCallback(async (backVideoEl) => {
    setError(null)
    setIsReady(false)

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Caméra non disponible sur cet appareil.')
      return false
    }

    const stream = await openStream('environment')

    if (!stream) {
      // Fallback : essaie la caméra avant si arrière indisponible
      const frontStream = await openStream('user')
      if (!frontStream) {
        setError('Accès aux caméras refusé ou indisponible.')
        return false
      }
      backStreamRef.current = frontStream
    } else {
      backStreamRef.current = stream
    }

    if (backVideoEl) {
      backVideoEl.srcObject = backStreamRef.current
      await waitForVideo(backVideoEl)
    }

    setIsReady(true)
    return true
  }, [])

  /**
   * Capture séquentielle :
   * 1. Snap caméra arrière (depuis le viewfinder actif)
   * 2. Ferme la caméra arrière
   * 3. Ouvre la caméra avant brièvement
   * 4. Attend initialisation (~600ms)
   * 5. Snap caméra avant (en miroir)
   * 6. Ferme la caméra avant
   *
   * @param {HTMLVideoElement} backVideoEl  Élément <video> du viewfinder
   * @returns {{ photoBack: string|null, photoFront: string|null }}
   */
  const capture = useCallback(async (backVideoEl) => {
    setIsCapturing(true)

    // 1. Snap arrière depuis le viewfinder
    const photoBack = captureFrame(backVideoEl, false)

    // 2. Ferme la caméra arrière
    stopStream(backStreamRef)
    if (backVideoEl) backVideoEl.srcObject = null
    setIsReady(false)

    // 3. Ouvre la caméra avant
    let photoFront = null
    try {
      const frontStream = await openStream('user')
      if (frontStream && backVideoEl) {
        frontStreamRef.current = frontStream
        backVideoEl.srcObject  = frontStream   // réutilise le même élément <video>
        await waitForVideo(backVideoEl, 2000)
        photoFront = captureFrame(backVideoEl, true)  // miroir
      }
    } catch {
      // Caméra avant indisponible → photoFront reste null
    } finally {
      stopStream(frontStreamRef)
      if (backVideoEl) backVideoEl.srcObject = null
    }

    setIsCapturing(false)
    return { photoBack, photoFront }
  }, [])

  /**
   * Arrête tous les streams (ex: fermeture de l'écran caméra).
   */
  const stopStreams = useCallback(() => {
    stopStream(backStreamRef)
    stopStream(frontStreamRef)
    setIsReady(false)
    setIsCapturing(false)
  }, [])

  return {
    openBackCamera,
    capture,
    stopStreams,
    isReady,
    isCapturing,
    error,
  }
}
