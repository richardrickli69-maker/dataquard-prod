import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function logAudit({
  user_id,
  action,
  resource,
  details,
  ip_address,
}: {
  user_id: string
  action: string
  resource?: string
  details?: object
  ip_address?: string
}) {
  try {
    await supabaseAdmin.from('audit_log').insert({
      user_id,
      action,
      resource,
      details,
      ip_address,
    })
  } catch (e) {
    console.error('Audit log error:', e)
  }
}
