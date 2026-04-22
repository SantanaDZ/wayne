import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DepartmentsList } from '@/components/departments/departments-list'
import type { Department } from '@/lib/types/database'

export const metadata = { title: 'Departamentos' }

export default async function DepartmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: departments } = await supabase
    .from('departments')
    .select(`
      *,
      locations:department_locations (
        *,
        sectors:department_sectors (*)
      )
    `)
    .order('name')

  return <DepartmentsList departments={(departments as Department[]) ?? []} />
}
