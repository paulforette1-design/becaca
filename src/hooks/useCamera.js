import { useState, useRef, useCallback } from 'react'

/**
 * Double caméra : frontale (selfie) + arrière (environnement).
 *
 * Usage avec CameraScreen :
 *   openStreams(backVideoEl, frontVideoEl) → attache les streams aux éléments <video>
 *   capture(backVideoEl, frontVideoEl)    → snappe et stoppe les streams
 *   stopStreams()                         → stoppe sans capturer (ex: fermeture)
 */
export const useCamera = () => {
  const [isReady, setIsReady]   = useState(false)
  const [error,   setError]     = useState(null)
  const backStreamRef           = useRef(null)
  const frontStreamRef          = useRef(null)

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

  /**
   * Ouvre les deux streams et les attache aux éléments <video> fournis.
   * Retourne true si au moins une caméra est disponible.
   */
  const openStreams = useCallback(async (backVideoEl, frontVideoEl) => {
    setError(null)
    setIsReady(false)

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Caméra non disponible sur cet appareil.')
      return false
    }

    // Ouverture parallèle des deux caméras
    const [backStream, frontStream] = await Promise.all([
      openStream('environment'),
      openStream('user'),
    ])

    backStreamRef.current  = backStream
    frontStreamRef.current = frontStream

    if (backStream && backVideoEl) {
      backVideoEl.srcObject = backStream
    }
    if (frontStream && frontVideoEl) {
      frontVideoEl.srcObject = frontStream
    }

    if (!backStream && !frontStream) {
      setError('Accès aux caméras refusé ou indisponible.')
      return false
    }

    setIsReady(true)
    return true
  }, [])

  /**
   * Capture une image depuis un élément <video> via canvas.
   * @param {HTMLVideoElement} videoEl
   * @param {boolean} mirror — si true, retourne l'image horizontalement (caméra frontale)
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
   * Capture simultanée depuis les deux <video>, puis stoppe les streams.
   * La caméra frontale est capturée en miroir (cohérent avec le preview live).
   */
  const capture = useCallback((backVideoEl, frontVideoEl) => {
    const photoBack  = backStreamRef.current  ? captureFrame(backVideoEl,  false) : null
    const photoFront = frontStreamRef.current ? captureFrame(frontVideoEl, true)  : null

    // Stoppe immédiatement après la capture
    backStreamRef.current?.getTracks().forEach((t) => t.stop())
    frontStreamRef.current?.getTracks().forEach((t) => t.stop())
    backStreamRef.current  = null
    frontStreamRef.current = null
    setIsReady(false)

    return { photoBack, photoFront }
  }, [])

  /**
   * Stoppe les streams sans capturer (ex: fermeture de l'écran caméra).
   */
  const stopStreams = useCallback(() => {
    backStreamRef.current?.getTracks().forEach((t) => t.stop())
    frontStreamRef.current?.getTracks().forEach((t) => t.stop())
    backStreamRef.current  = null
    frontStreamRef.current = null
    setIsReady(false)
  }, [])

  return {
    openStreams,
    capture,
    stopStreams,
    isReady,
    error,
    backStreamRef,
    frontStreamRef,
  }
}
