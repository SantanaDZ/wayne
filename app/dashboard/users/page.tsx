import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UsersHeader } from '@/components/users/users-header'
import { UsersTable } from '@/components/users/users-table'
import type { Profile } from '@/lib/types/database'

export const metadata = {
  title: 'Administração de Usuários | Wayne Industries',
  description: 'Gerencie os operativos e colaboradores das Indústrias Wayne.',
}

async function getUsers(): Promise<Profile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data as Profile[]
}

async function getCurrentProfile(): Promise<{ user: { id: string }, profile: Profile | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile: profile as Profile | null }
}

export default async function UsersPage() {
  const [users, { user, profile }] = await Promise.all([
    getUsers(),
    getCurrentProfile(),
  ])

  const isAdmin = profile?.role === 'admin'
  const canManage = profile?.role === 'manager' || isAdmin

  if (!canManage) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <UsersHeader canManage={canManage} totalUsers={users.length} />
      <UsersTable
        users={users}
        currentUserId={user.id}
        canManage={canManage}
        isAdmin={isAdmin}
      />
    </div>
  )
}
