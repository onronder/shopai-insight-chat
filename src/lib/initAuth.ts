// File: src/lib/initAuth.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Initializes Supabase client with token from secure cookie.
 * Used on client load to hydrate the session.
 */
export async function bootstrapAuthFromCookie(): Promise<void> {
  const token = getCookie('sb-token');
  if (!token) return;

  try {
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: token, // Required param, even if not used
    });
  } catch (err) {
    console.error('⚠️ Failed to bootstrap Supabase session:', err);
  }
}

/**
 * Attempts to refresh the Supabase token silently.
 */
export async function refreshToken(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    const token = data?.session?.access_token;

    if (error || !token) {
      throw error || new Error('No session returned');
    }

    // Update token in cookie
    document.cookie = `sb-token=${token}; Path=/; Secure; SameSite=Lax`;

    return true;
  } catch (err) {
    console.error('🔐 Failed to refresh session token:', err);
    return false;
  }
}

/**
 * Reads a cookie by name.
 */
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export { supabase };
