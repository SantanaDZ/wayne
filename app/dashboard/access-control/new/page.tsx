import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AreaForm } from '@/components/access-control/area-form'

export const metadata = {
  title: 'Nova Área Restrita | Wayne Industries',
}

async function checkPermission() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager' && profile?.role !== 'admin') {
    redirect('/dashboard/access-control')
  }

  return user.id
}

export default async function NewRestrictedAreaPage() {
  await checkPermission()
  return <AreaForm />
}
