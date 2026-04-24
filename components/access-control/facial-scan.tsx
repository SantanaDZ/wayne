'use client'

import { useEffect } from 'react'

interface FacialScanProps {
  onComplete: () => void
}

export function FacialScan({ onComplete }: FacialScanProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4200)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="relative w-full bg-[radial-gradient(circle_at_top,_#0a0f1a,_#000)] overflow-hidden" style={{ height: 340 }}>
      <style>{`
        @keyframes scanMove {
          0%   { top: 28%; }
          50%  { top: 68%; }
          100% { top: 28%; }
        }
        @keyframes loadBar {
          0%   { width: 0% }
          40%  { width: 25% }
          60%  { width: 55% }
          80%  { width: 78% }
          95%  { width: 92% }
          100% { width: 100% }
        }
        @keyframes facePulse {
          0%, 100% { box-shadow: 0 0 40px rgba(59,130,246,0.15); }
          50%       { box-shadow: 0 0 70px rgba(59,130,246,0.35); }
        }
        @keyframes gridFade {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.55; }
        }
      `}</style>

      {/* Header */}
      <div className="absolute top-5 left-5 right-5 z-10">
        <p className="text-[#8ab4ff] font-mono text-sm tracking-widest uppercase">
          Scan Facial em Progresso
        </p>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 w-52 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #0ea5ff, #3b82f6)',
              boxShadow: '0 0 10px rgba(59,130,246,0.6)',
              animation: 'loadBar 4s ease-out forwards',
            }}
          />
        </div>
      </div>

      {/* Face silhouette */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 220,
          height: 280,
          transform: 'translate(-50%, -48%)',
          borderRadius: '50% 50% 45% 45%',
          border: '1px solid rgba(59,130,246,0.25)',
          backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.25) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
          animation: 'facePulse 2s ease-in-out infinite, gridFade 2s ease-in-out infinite',
        }}
      />

      {/* Corner brackets */}
      {[
        { top: '18%', left: '22%',  borderTop: '2px solid #3b82f6', borderLeft:  '2px solid #3b82f6' },
        { top: '18%', right: '22%', borderTop: '2px solid #3b82f6', borderRight: '2px solid #3b82f6' },
        { bottom: '22%', left: '22%',  borderBottom: '2px solid #3b82f6', borderLeft:  '2px solid #3b82f6' },
        { bottom: '22%', right: '22%', borderBottom: '2px solid #3b82f6', borderRight: '2px solid #3b82f6' },
      ].map((style, i) => (
        <div key={i} style={{ position: 'absolute', width: 20, height: 20, ...style }} />
      ))}

      {/* Scan line */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          width: 220,
          height: 2,
          transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
          boxShadow: '0 0 14px #3b82f6',
          animation: 'scanMove 2s ease-in-out infinite',
        }}
      />

      {/* Bottom status */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <span className="text-[10px] font-mono text-[#3b82f6]/60 tracking-[0.3em] uppercase animate-pulse">
          Analisando padrão biométrico...
        </span>
      </div>
    </div>
  )
}
