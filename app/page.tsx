import Link from 'next/link'
import { WayneLogo } from '@/components/wayne-logo'
import { HomeSplash } from '@/components/home-splash'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center">
      <HomeSplash />
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/locais/predio.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-black/90" />

      {/* Header with Login/Register Link - Slightly centered top right */}
      <header className="absolute top-0 w-full z-10 flex items-center justify-between px-8 md:px-16 py-8">
        <WayneLogo src="/logo transparente.png" className="h-8 w-8 opacity-100" />

        <nav className="flex items-center gap-1 border border-white/10 bg-black/50 backdrop-blur-md px-2 py-1.5">
          {user ? (
            <Link
              href="/dashboard"
              className="font-sans text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors px-5 py-1"
            >
              Ir para o Painel
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="font-sans text-sm text-white/60 hover:text-white hover:bg-white/8 transition-colors px-5 py-1"
              >
                Login
              </Link>
              <span className="w-px h-4 bg-white/15" />
              <Link
                href="/auth/sign-up"
                className="font-sans text-sm text-white/60 hover:bg-white/20 transition-colors px-5 py-1"
              >
                Cadastro
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Center Content: Logo */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        <WayneLogo className="h-56 w-56 md:h-80 md:w-80 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] -mb-12" />
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-[0.25em] drop-shadow-lg uppercase mb-4">
          Wayne Enterprises
        </h1>
        <p className="text-sm md:text-base text-zinc-400 font-light tracking-widest max-w-lg uppercase">
          Sistema de Controle & Segurança
        </p>
      </main>
    </div>
  )
}
