import { create, verify } from "https://deno.land/x/djwt@v2.8/mod.ts";

interface JWTPayload {
  sub?: string;
  role?: string;
  [key: string]: unknown; // Extendable for additional claims
}

/**
 * Creates a signed JWT with a given payload.
 */
export async function createJWT(payload: JWTPayload): Promise<string> {
  const secret = Deno.env.get("JWT_SECRET");
  if (!secret) throw new Error("JWT_SECRET is not set");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  return await create({ alg: "HS256", typ: "JWT" }, payload, key);
}

/**
 * Verifies and decodes a JWT. Returns null if invalid or expired.
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  const secret = Deno.env.get("JWT_SECRET");
  if (!secret) throw new Error("JWT_SECRET is not set");

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  try {
    const payload = await verify(token, key);
    return payload as JWTPayload;
  } catch {
    return null;
  }
}
