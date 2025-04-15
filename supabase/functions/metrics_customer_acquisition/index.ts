// File: supabase/functions/metrics_customer_acquisition/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyJWT } from "../_shared/jwt.ts";
import { checkRateLimit, addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv/load.ts";

// Initialize Supabase with elevated service role
const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo("metrics_customer_acquisition", "Request started", { path });

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    let store_id: string | null = null;

    // Try session token
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.id) store_id = user.id;
    } catch {
      store_id = null;
    }

    // Fallback to JWT if session failed
    if (!store_id && token) {
      const verified = await verifyJWT(token);
      if (verified?.sub) store_id = verified.sub;
    }

    if (!store_id) {
      return addSecurityHeaders(returnJsonError(401, "Unauthorized"));
    }

    // Rate limit check
    const clientIp = req.headers.get("x-real-ip") || "unknown";
    const rate = await checkRateLimit(clientIp, store_id);
    if (!rate.allowed) {
      return addSecurityHeaders(
        returnJsonError(429, "Rate limit exceeded"),
        rate.headers
      );
    }

    const { data, error } = await supabase
      .from("vw_customer_acquisition")
      .select("period, new_customers")
      .eq("store_id", store_id)
      .order("period", { ascending: true });

    if (error) {
      logError("metrics_customer_acquisition", error, { store_id });
      return addSecurityHeaders(
        returnJsonError(500, "Error fetching customer acquisition")
      );
    }

    logInfo("metrics_customer_acquisition", "Request completed", {
      store_id,
      duration_ms: performance.now() - startTime,
      count: data.length
    });

    return addSecurityHeaders(
      new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...rate.headers
        }
      })
    );
  } catch (err) {
    logError("metrics_customer_acquisition", err, { path });

    return addSecurityHeaders(
      returnJsonError(500, "Internal Server Error")
    );
  }
});
