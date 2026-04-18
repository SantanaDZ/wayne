import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/settings/profile-form'
import { PasswordForm } from '@/components/settings/password-form'
import type { Profile } from '@/lib/types/database'

export const metadata = {
  title: 'Configurações | Wayne Industries',
  description: 'Gerencie seu perfil e preferências de conta.',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie seu perfil e segurança da conta</p>
      </div>

      <ProfileForm profile={profile as Profile} userId={user.id} email={user.email ?? ''} />
      <PasswordForm />
    </div>
  )
}
