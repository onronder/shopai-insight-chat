// File: supabase/functions/_shared/cookies.ts

/**
 * Generates a secure, HTTP-only cookie string.
 *
 * @param name - The cookie name
 * @param value - The cookie value
 * @param maxAge - Optional expiration in seconds (default: 3600)
 * @param extraOptions - Optional additional flags (e.g. Path=/)
 * @returns A secure cookie string
 */
export function setSecureCookie(
    name: string,
    value: string,
    maxAge: number = 3600,
    extraOptions: string = ""
  ): string {
    return `${name}=${value}; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}${
      extraOptions ? `; ${extraOptions}` : ""
    }`;
  }
  