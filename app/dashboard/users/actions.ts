'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/types/database'

interface CreateUserInput {
  full_name: string
  email: string
  password: string
  role: UserRole
  department: string
}

interface UpdateUserInput {
  id: string
  full_name: string
  role: UserRole
  department: string
  pin?: string
}

export async function createUserAction(input: CreateUserInput) {
  try {
    // Only admins can create users
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return { error: 'Não autenticado.' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (profile?.role !== 'admin' && profile?.role !== 'manager') {
      return { error: 'Sem permissão para criar usuários.' }
    }

    const adminSupabase = createAdminClient()

    // Create auth user
    const { data: newAuthUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.full_name },
    })

    if (authError || !newAuthUser.user) {
      return { error: authError?.message || 'Erro ao criar usuário.' }
    }

    // Upsert profile
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .upsert({
        id: newAuthUser.user.id,
        full_name: input.full_name,
        role: input.role,
        department: input.department || null,
      })

    if (profileError) {
      // Rollback auth user on profile failure
      await adminSupabase.auth.admin.deleteUser(newAuthUser.user.id)
      return { error: profileError.message }
    }

    return { success: true }
  } catch (err) {
    console.error('createUserAction error:', err)
    return { error: 'Erro inesperado ao criar usuário.' }
  }
}

export async function updateUserAction(input: UpdateUserInput) {
  try {
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return { error: 'Não autenticado.' }

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (callerProfile?.role !== 'admin' && callerProfile?.role !== 'manager') {
      return { error: 'Sem permissão para editar usuários.' }
    }

    // Managers cannot promote to admin
    if (callerProfile?.role === 'manager' && input.role === 'admin') {
      return { error: 'Gerentes não podem promover usuários a administrador.' }
    }

    const update: Record<string, unknown> = {
      full_name: input.full_name,
      role: input.role,
      department: input.department || null,
      updated_at: new Date().toISOString(),
    }
    if (input.pin !== undefined) {
      update.pin = input.pin || null
    }

    const { error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', input.id)

    if (error) return { error: error.message }

    return { success: true }
  } catch (err) {
    console.error('updateUserAction error:', err)
    return { error: 'Erro inesperado ao atualizar usuário.' }
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return { error: 'Não autenticado.' }

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return { error: 'Apenas administradores podem excluir usuários.' }
    }

    if (userId === currentUser.id) {
      return { error: 'Você não pode excluir sua própria conta.' }
    }

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.auth.admin.deleteUser(userId)

    if (error) return { error: error.message }

    return { success: true }
  } catch (err) {
    console.error('deleteUserAction error:', err)
    return { error: 'Erro inesperado ao excluir usuário.' }
  }
}
