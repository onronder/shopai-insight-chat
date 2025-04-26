// File: supabase/functions/shopify_auth_start/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const SHOPIFY_API_KEY = Deno.env.get("PROJECT_SHOPIFY_API_KEY")!;
const PROJECT_SUPABASE_URL = Deno.env.get("PROJECT_SUPABASE_URL")!;
const PROJECT_SHOPIFY_SCOPES = Deno.env.get("PROJECT_SHOPIFY_SCOPES")!;

serve((req) => {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");

  if (!shop) {
    return new Response("Missing shop parameter", { status: 400 });
  }

  const redirectUri = encodeURIComponent(`${PROJECT_SUPABASE_URL}/functions/v1/shopify_oauth_callback`);

  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${PROJECT_SHOPIFY_SCOPES}&redirect_uri=${redirectUri}`;

  return Response.redirect(authUrl, 302);
});
