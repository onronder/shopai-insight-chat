/** 
 * @deprecated 
 * This file is deprecated and not used anywhere in the current architecture.
 * All data fetching is handled via secureFetch + typed React Query hooks.
 * Safe to delete entirely. 
 */



import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyJWT } from "../_shared/jwt.ts";
import { checkRateLimit, addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv/load.ts";

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo("metrics_order_statuses", "Request started", { path });

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    let store_id: string | null = null;

    // Try Supabase auth first
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.id) store_id = user.id;
    } catch {
      store_id = null;
    }

    // Fallback to custom JWT
    if (!store_id && token) {
      const verified = await verifyJWT(token);
      if (verified?.sub) store_id = verified.sub;
    }

    if (!store_id) {
      return addSecurityHeaders(returnJsonError(401, "Unauthorized"));
    }

    // Check rate limit
    const clientIp = req.headers.get("x-real-ip") || "unknown";
    const rate = await checkRateLimit(clientIp, store_id);
    if (!rate.allowed) {
      return addSecurityHeaders(returnJsonError(429, "Rate limit exceeded"), rate.headers);
    }

    // Query the data view
    const { data, error } = await supabase
      .from("vw_order_status_distribution")
      .select("*")
      .eq("store_id", store_id)
      .order("order_count", { ascending: false });

    if (error) {
      logError("metrics_order_statuses", error, { store_id });
      return addSecurityHeaders(returnJsonError(500, "Failed to fetch order status data"));
    }

    logInfo("metrics_order_statuses", "Request completed", {
      path,
      store_id,
      duration_ms: performance.now() - startTime,
      records: data.length
    });

    return addSecurityHeaders(new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...rate.headers
      }
    }));
  } catch (err) {
    logError("metrics_order_statuses", err, { path });
    return addSecurityHeaders(returnJsonError(500, "Internal Server Error"));
  }
});
