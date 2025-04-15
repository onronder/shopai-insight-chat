// File: supabase/functions/_shared/jwt.ts

import { create, verify } from "https://deno.land/x/djwt@v2.8/mod.ts";

/**
 * Creates a signed JWT with a given payload.
 */
export async function createJWT(payload: Record<string, any>): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(Deno.env.get("JWT_SECRET")!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  return await create({ alg: "HS256", typ: "JWT" }, payload, key);
}

/**
 * Verifies and decodes a JWT. Returns null if invalid or expired.
 */
export async function verifyJWT(token: string): Promise<Record<string, any> | null> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(Deno.env.get("JWT_SECRET")!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  try {
    return await verify(token, key) as Record<string, any>;
  } catch {
    return null;
  }
}
