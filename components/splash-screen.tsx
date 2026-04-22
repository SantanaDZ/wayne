'use client'

import { useEffect, useRef, useState } from 'react'

export function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!sessionStorage.getItem('wayne-show-splash')) return

    sessionStorage.removeItem('wayne-show-splash')
    setVisible(true)
  }, [])

  useEffect(() => {
    if (!visible) return

    const video = videoRef.current
    if (!video) return

    const dismiss = () => {
      setFading(true)
      setTimeout(() => setVisible(false), 800)
    }

    video.addEventListener('ended', dismiss)
    return () => video.removeEventListener('ended', dismiss)
  }, [visible])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-700"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <video
        ref={videoRef}
        src="/logo-wayne.mp4"
        autoPlay
        playsInline
        className="max-w-full max-h-full w-auto h-auto"
      />
    </div>
  )
}
