// Opção B — Pulse de Horizonte + Vinheta Cinematic
// Para usar: importe e coloque antes do conteúdo em app/page.tsx

export function BackgroundB() {
  return (
    <>
      <style>{`
        .bg-b {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          background: url('/background-oficial.png') center/cover no-repeat;
        }

        /* Vinheta escura nas bordas — sempre presente */
        .bg-b-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            transparent 40%,
            rgba(0,0,0,0.72) 100%
          );
        }

        /* Horizonte pulsante no centro inferior */
        .bg-b-horizon {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 55%;
          background: linear-gradient(
            to top,
            rgba(0,100,220,0.18) 0%,
            transparent 100%
          );
          animation: bgBHorizon 5s ease-in-out infinite;
        }

        @keyframes bgBHorizon {
          0%, 100% { opacity: 0.5; transform: scaleY(1);   }
          50%       { opacity: 1;   transform: scaleY(1.08); }
        }

        /* Raios de luz verticais sutis */
        .bg-b-rays {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            90deg,
            transparent 0px,
            transparent 120px,
            rgba(0,140,255,0.04) 121px,
            rgba(0,140,255,0.04) 122px
          );
          animation: bgBRays 12s linear infinite;
        }

        @keyframes bgBRays {
          from { background-position: 0 0;    }
          to   { background-position: 122px 0; }
        }

        /* Flicker muito sutil no topo — atmosfera */
        .bg-b-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 30%;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.5) 0%,
            transparent 100%
          );
          animation: bgBTop 8s ease-in-out infinite;
        }

        @keyframes bgBTop {
          0%, 100% { opacity: 1;   }
          45%       { opacity: 0.6; }
          55%       { opacity: 0.8; }
        }
      `}</style>

      <div className="bg-b">
        <div className="bg-b-vignette" />
        <div className="bg-b-horizon" />
        <div className="bg-b-rays" />
        <div className="bg-b-top" />
      </div>
    </>
  )
}
