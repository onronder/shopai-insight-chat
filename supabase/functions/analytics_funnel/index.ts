// supabase/functions/analytics_funnel/index.ts

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
  const url = new URL(req.url);

  try {
    logInfo("analytics_funnel", "Request started", { path });

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    let store_id: string | null = null;
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user?.id) store_id = user.id;

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

    // These values are mocked; ideally replace with real tracked data
    const sessions = 10000;
    const carts = 3000;
    const checkouts = 1800;

    const { count: purchases, error } = await supabase
      .from("shopify_orders")
      .select("id", { count: "exact", head: true })
      .eq("store_id", store_id)
      .is("is_deleted", false);

    if (error) {
      logError("analytics_funnel", error.message, { store_id });
      return addSecurityHeaders(returnJsonError(500, "Failed to fetch funnel"));
    }

    const funnelData = [
      { name: "Sessions", value: sessions },
      { name: "Cart", value: carts },
      { name: "Checkout", value: checkouts },
      { name: "Purchase", value: purchases || 0 }
    ];

    logInfo("analytics_funnel", "Success", {
      store_id,
      count: funnelData.length,
      duration_ms: performance.now() - startTime,
    });

    return addSecurityHeaders(
      new Response(JSON.stringify(funnelData), {
        status: 200,
        headers: { "Content-Type": "application/json", ...rate.headers },
      })
    );
  } catch (err) {
    logError("analytics_funnel", err, { path });
    return addSecurityHeaders(returnJsonError(500, "Internal Server Error"));
  }
});
