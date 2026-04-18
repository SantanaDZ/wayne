import type { SupabaseClient } from '@supabase/supabase-js'

type Action = 'create' | 'update' | 'delete'

export async function logActivity(
  supabase: SupabaseClient,
  userId: string,
  action: Action,
  resourceType: string,
  resourceId: string | null,
  details?: Record<string, unknown>,
) {
  const { error } = await supabase.from('activity_logs').insert({
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details: details ?? {},
  })

  if (error) {
    console.error('logActivity error:', JSON.stringify(error))
  }
}
