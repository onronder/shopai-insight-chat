// File: supabase/functions/metrics_sales_over_time/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { verifyJWT } from "../_shared/jwt.ts";
import { checkRateLimit, addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req: Request): Promise<Response> => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo("metrics_sales_over_time", "Request started", { path });

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
      .from("view_sales_over_time_with_targets")
      .select("name, sales, target")
      .eq("store_id", store_id)
      .order("name", { ascending: true });

    if (error) {
      logError("metrics_sales_over_time", error, { store_id });
      return addSecurityHeaders(returnJsonError(500, "Failed to fetch sales data"));
    }

    const salesData = (data ?? []).map((item) => ({
      name: item.name,
      sales: Number(item.sales ?? 0),
      target: Number(item.target ?? 0),
    }));

    logInfo("metrics_sales_over_time", "Request completed", {
      store_id,
      records: salesData.length,
      duration_ms: performance.now() - startTime,
    });

    return addSecurityHeaders(
      new Response(JSON.stringify(salesData), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...rate.headers,
        },
      })
    );
  } catch (err) {
    logError("metrics_sales_over_time", err instanceof Error ? err : new Error("Unknown error"), { path });
    return addSecurityHeaders(returnJsonError(500, "Internal Server Error"));
  }
});
