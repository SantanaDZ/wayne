import { WayneLogo } from '@/components/wayne-logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Background w/ Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background-oficial.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-background/50" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <WayneLogo className="h-36 w-36 -mb-6" />
          <h1 className="text-2xl font-bold text-foreground">Industrias Wayne</h1>
          <p className="text-muted-foreground text-sm">Sistema de Gestao de Recursos</p>
        </div>
        {children}
      </div>
    </div>
  )
}
