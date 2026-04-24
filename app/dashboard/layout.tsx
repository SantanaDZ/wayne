import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { SplashScreen } from '@/components/splash-screen'
import { RouteGate } from '@/components/access-control/route-gate'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <SidebarProvider>
      <SplashScreen />
      <DashboardSidebar user={user} profile={profile} />
      <SidebarInset className="relative bg-background/95">
        <div
          className="absolute inset-0 z-[-1] bg-cover bg-center bg-no-repeat bg-fixed opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: "url('/background-dashoard.png')" }}
        />
        <DashboardHeader user={user} profile={profile} />
        <main className="flex-1 p-4 md:p-6">
          <RouteGate profile={profile}>
            {children}
          </RouteGate>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
