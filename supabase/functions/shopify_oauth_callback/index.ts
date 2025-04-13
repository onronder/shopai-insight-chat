// supabase/functions/shopify_oauth_callback/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/dotenv/load.ts";

const SHOPIFY_API_KEY = Deno.env.get("PROJECT_SHOPIFY_API_KEY")!;
const SHOPIFY_API_SECRET = Deno.env.get("PROJECT_SHOPIFY_API_SECRET")!;
const PROJECT_SERVICE_ROLE_KEY = Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!;
const PROJECT_SUPABASE_URL = Deno.env.get("PROJECT_SUPABASE_URL")!;
const JWT_SECRET = Deno.env.get("JWT_SECRET")!;

serve(async (req) => {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");
  const code = searchParams.get("code");

  if (!shop || !code) {
    return new Response("Missing shop or code", { status: 400 });
  }

  // Exchange code for access token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return new Response("Failed to get access token", { status: 401 });
  }

  const { access_token } = await tokenRes.json();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Check if store already exists
  const { data: existing, error: fetchError } = await supabase
    .from("stores")
    .select("id")
    .eq("shop_domain", shop)
    .maybeSingle();

  let store_id = existing?.id;

  if (store_id) {
    await supabase.from("stores").update({ access_token }).eq("id", store_id);
  } else {
    const { data, error } = await supabase
      .from("stores")
      .insert({ shop_domain: shop, access_token })
      .select("id")
      .single();

    if (error || !data) {
      return new Response("Store creation failed", { status: 500 });
    }

    store_id = data.id;
  }

  // TODO: Generate Supabase JWT here (coming in next step)

  // For now: return a success placeholder
  // --- JWT Section ---
const now = Math.floor(Date.now() / 1000);
const header = {
  alg: "HS256",
  typ: "JWT",
};
const payload = {
  sub: store_id,
  role: "authenticated",
  iat: now,
  exp: now + 60 * 60, // expires in 1 hour
};

function base64url(input: string): string {
  return btoa(input)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

const encoder = new TextEncoder();
const key = await crypto.subtle.importKey(
  "raw",
  encoder.encode(Deno.env.get("JWT_SECRET")!),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign"]
);

const encodedHeader = base64url(JSON.stringify(header));
const encodedPayload = base64url(JSON.stringify(payload));
const unsignedToken = `${encodedHeader}.${encodedPayload}`;

const signatureBuffer = await crypto.subtle.sign(
  "HMAC",
  key,
  encoder.encode(unsignedToken)
);

const signature = base64url(String.fromCharCode(...new Uint8Array(signatureBuffer)));
const jwt = `${unsignedToken}.${signature}`;

// --- Redirect user back to frontend with token ---
const redirectUrl = `http://localhost:3000?token=${jwt}`;
return Response.redirect(redirectUrl, 302);

});
