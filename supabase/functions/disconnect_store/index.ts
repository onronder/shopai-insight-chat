// File: supabase/functions/disconnect_store/index.ts

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { verifyJWT } from "../_shared/jwt.ts";
import { checkRateLimit, addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";

serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return addSecurityHeaders(
      new Response("Method Not Allowed", { status: 405 })
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return returnJsonError(401, "Missing or invalid Authorization header");
  }

  const jwt = authHeader.replace("Bearer ", "").trim();
  const jwtPayload = await verifyJWT(jwt);

  const storeId = typeof jwtPayload?.store_id === "string" ? jwtPayload.store_id : null;
  if (!storeId) {
    return returnJsonError(401, "Invalid JWT or missing store_id");
  }

  const clientIp = req.headers.get("x-forwarded-for") || "unknown";
  const rate = await checkRateLimit(clientIp, storeId);

  if (!rate.allowed) {
    return addSecurityHeaders(returnJsonError(429, "Rate limit exceeded"), rate.headers);
  }

  const supabase = createClient(
    Deno.env.get("PROJECT_SUPABASE_URL")!,
    Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
  );

  const { error: updateError } = await supabase
    .from("stores")
    .update({
      disconnected_at: new Date().toISOString(),
      sync_status: "idle",
    })
    .eq("id", storeId);

  if (updateError) {
    await logError("disconnect_store", updateError, { storeId });
    return addSecurityHeaders(returnJsonError(500, "Failed to disconnect store"));
  }

  await logInfo("disconnect_store", "Store disconnected", { storeId });

  return addSecurityHeaders(
    new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...rate.headers },
    })
  );
});
