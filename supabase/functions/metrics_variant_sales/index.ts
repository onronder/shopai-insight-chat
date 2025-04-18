// File: supabase/functions/metrics_variant_sales/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyJWT } from "../_shared/jwt.ts";
import { checkRateLimit, addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo("metrics_variant_sales", "Request started", { path });

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    let store_id: string | null = null;

    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.id) store_id = user.id;
    } catch {
      store_id = null;
    }

    if (!store_id && token) {
      const verified = await verifyJWT(token);
      if (verified?.sub) store_id = verified.sub;
    }

    if (!store_id) {
      return addSecurityHeaders(returnJsonError(401, "Unauthorized"));
    }

    const clientIp = req.headers.get("x-real-ip") || "unknown";
    const rate = await checkRateLimit(clientIp, store_id);
    if (!rate.allowed) {
      return addSecurityHeaders(returnJsonError(429, "Rate limit exceeded"), rate.headers);
    }

    const { data, error } = await supabase
      .from("vw_variant_sales_summary")
      .select("*")
      .eq("store_id", store_id)
      .order("total_revenue", { ascending: false });

    if (error) {
      logError("metrics_variant_sales", error, { store_id });
      return addSecurityHeaders(returnJsonError(500, "Failed to fetch variant sales summary"));
    }

    // ✅ Transform data to expected frontend format
    const transformed = (data ?? []).map(item => ({
      variant_title: item.sku ?? 'Unnamed Variant',
      total_sales: Number(item.total_revenue ?? 0)
    }));

    logInfo("metrics_variant_sales", "Request completed", {
      store_id,
      count: transformed.length,
      duration_ms: performance.now() - startTime
    });

    return addSecurityHeaders(new Response(JSON.stringify(transformed), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...rate.headers
      }
    }));
  } catch (err) {
    logError("metrics_variant_sales", err, { path });
    return addSecurityHeaders(returnJsonError(500, "Internal Server Error"));
  }
});
