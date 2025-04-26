// File: supabase/functions/_shared/verifyShopifySession.ts

import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyResult } from "https://deno.land/x/jose@v4.14.4/index.ts";

const SHOPIFY_JWKS_URL = "https://shopify.dev/.well-known/jwks.json";
const JWKS = createRemoteJWKSet(new URL(SHOPIFY_JWKS_URL));

/**
 * Verifies a Shopify session token (embedded app JWT) securely.
 * 
 * @param token - The bearer token extracted from Authorization header.
 * @param expectedAudience - Your app's public API key (Shopify App API Key).
 * @returns The decoded JWT payload if valid, throws error otherwise.
 */
export async function verifyShopifySessionToken(
  token: string,
  expectedAudience: string
): Promise<JWTPayload> {
  if (!token) {
    throw new Error("Missing session token");
  }

  try {
    const { payload }: JWTVerifyResult = await jwtVerify(token, JWKS, {
      issuer: "https://shopify.dev",
      audience: expectedAudience,
    });

    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid session token payload");
    }

    return payload;
  } catch (error) {
    console.error("Session token verification failed:", error);
    throw new Error("Unauthorized: Invalid session token");
  }
}
