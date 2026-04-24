// Opção A — Light Sweep + Partículas
// Para usar: importe e coloque antes do conteúdo em app/page.tsx

export function BackgroundA() {
  return (
    <>
      <style>{`
        .bg-a {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          background: url('/background-oficial.png') center/cover no-repeat;
        }

        /* Partículas em movimento */
        .bg-a-particles {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(0,132,255,0.35) 1px, transparent 1px);
          background-size: 80px 80px;
          opacity: 0.18;
          animation: bgAParticles 20s linear infinite;
        }

        @keyframes bgAParticles {
          from { background-position: 0 0; }
          to   { background-position: 300px 300px; }
        }

        /* Light sweep */
        .bg-a-sweep {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            transparent 30%,
            rgba(0,140,255,0.25) 50%,
            transparent 70%
          );
          transform: translateX(-100%);
          animation: bgASweep 6s ease-in-out infinite;
        }

        @keyframes bgASweep {
          0%       { transform: translateX(-100%); }
          60%, 100% { transform: translateX(100%); }
        }
      `}</style>

      <div className="bg-a">
        <div className="bg-a-particles" />
        <div className="bg-a-sweep" />
      </div>
    </>
  )
}
