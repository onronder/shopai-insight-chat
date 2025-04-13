import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function bootstrapAuthFromToken(token: string) {
  try {
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: token, // this is required by the method but won't be used
    })
  } catch (error) {
    console.error("Failed to set Supabase session:", error)
  }
}
