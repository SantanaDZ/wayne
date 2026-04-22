'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAdminSupabase() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' as string, supabase: null, adminOk: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Apenas administradores podem gerenciar departamentos.' as string, supabase: null, adminOk: false }
  }

  return { error: null, supabase, adminOk: true }
}

// ── Departments ────────────────────────────────────────────────────────────────

export async function createDepartmentAction(input: { name: string; description?: string }) {
  const { error: authError, supabase } = await getAdminSupabase()
  if (authError || !supabase) return { error: authError }

  const { error } = await supabase
    .from('departments')
    .insert({ name: input.name.trim(), description: input.description?.trim() || null })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/departments')
  return { success: true }
}

export async function updateDepartmentAction(input: { id: string; name: string; description?: string }) {
  const { error: authError, supabase } = await getAdminSupabase()
  if (authError || !supabase) return { error: authError }

  const { error } = await supabase
    .from('departments')
    .update({ name: input.name.trim(), description: input.description?.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', input.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/departments')
  return { success: true }
}

export async function deleteDepartmentAction(id: string) {
  const { error: authError, supabase } = await getAdminSupabase()
  if (authError || !supabase) return { error: authError }

  const { error } = await supabase.from('departments').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/departments')
  return { success: true }
}

// ── Locations ─────────────────────────────────────────────────────────────────

export async function createLocationAction(input: { department_id: string; name: string }) {
  const { error: authError, supabase } = await getAdminSupabase()
  if (authError || !supabase) return { error: authError }

  const { error } = await supabase
    .from('department_locations')
    .insert({ department_id: input.department_id, name: input.name.trim() })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/departments')
  return { success: true }
}

export async function updateLocationAction(input: { id: string; name: string }) {
  const { error: authError, supabase } = await getAdminSupabase()
  if (authError || !supabase) return { error: authError }

  const { error } = await supabase
    .from('department_locations')
    .update({ name: input.name.trim() })
    .eq('id', input.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/departments')
  return { success: true }
}

export async function deleteLocationAction(id: string) {
  const { error: authError, supabase } = await getAdminSupabase()
  if (authError || !supabase) return { error: authError }

  const { error } = await supabase.from('department_locations').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/departments')
  return { success: true }
}

// ── Sectors ───────────────────────────────────────────────────────────────────

export async function createSectorAction(input: { location_id: string; name: string }) {
  const { error: authError, supabase } = await getAdminSupabase()
  if (authError || !supabase) return { error: authError }

  const { error } = await supabase
    .from('department_sectors')
    .insert({ location_id: input.location_id, name: input.name.trim() })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/departments')
  return { success: true }
}

export async function updateSectorAction(input: { id: string; name: string }) {
  const { error: authError, supabase } = await getAdminSupabase()
  if (authError || !supabase) return { error: authError }

  const { error } = await supabase
    .from('department_sectors')
    .update({ name: input.name.trim() })
    .eq('id', input.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/departments')
  return { success: true }
}

export async function deleteSectorAction(id: string) {
  const { error: authError, supabase } = await getAdminSupabase()
  if (authError || !supabase) return { error: authError }

  const { error } = await supabase.from('department_sectors').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/departments')
  return { success: true }
}
