// File: supabase/functions/_shared/security.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Constants for rate limiting
const RATE_LIMIT_REQUESTS = 60;
const RATE_LIMIT_WINDOW_SECONDS = 60;

/**
 * Enforces per-store + per-IP rate limiting.
 */
export async function checkRateLimit(
  clientIp: string,
  storeId: string
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const supabase = createClient(
    Deno.env.get("PROJECT_SUPABASE_URL")!,
    Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
  );

  const windowStart = new Date();
  windowStart.setSeconds(windowStart.getSeconds() - RATE_LIMIT_WINDOW_SECONDS);

  const { count, error } = await supabase
    .from("api_requests")
    .select("*", { count: "exact" })
    .eq("store_id", storeId)
    .eq("client_ip", clientIp)
    .gte("created_at", windowStart.toISOString());

  if (error) {
    console.error("[Rate Limit Error]", error.message);
    return { allowed: true, headers: {} }; // fail-open fallback
  }

  const requestCount = count ?? 0;

  if (requestCount >= RATE_LIMIT_REQUESTS) {
    return {
      allowed: false,
      headers: {
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": RATE_LIMIT_WINDOW_SECONDS.toString(),
      },
    };
  }

  await supabase.from("api_requests").insert({ store_id: storeId, client_ip: clientIp });

  return {
    allowed: true,
    headers: {
      "X-RateLimit-Remaining": String(RATE_LIMIT_REQUESTS - (requestCount + 1)),
    },
  };
}

/**
 * Applies default security headers to a response.
 */
export function addSecurityHeaders(
  res: Response,
  additionalHeaders: Record<string, string> = {}
): Response {
  const baseHeaders: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self'; connect-src 'self' https://*.supabase.co https://*.myshopify.com; style-src 'self' 'unsafe-inline';",
    ...additionalHeaders,
  };

  const newHeaders = new Headers(res.headers);
  for (const [key, value] of Object.entries(baseHeaders)) {
    newHeaders.set(key, value);
  }

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: newHeaders,
  });
}

/**
 * Returns a JSON error response with proper content type and status code.
 */
export function returnJsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
