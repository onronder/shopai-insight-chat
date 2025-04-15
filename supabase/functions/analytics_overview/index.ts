import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyJWT } from "../_shared/jwt.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logError, logInfo } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const start = performance.now();
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");

  try {
    const { data: { user } } = await supabase.auth.getUser(token);
    const store_id = user?.id;

    if (!store_id) {
      const jwt = await verifyJWT(token);
      if (!jwt?.sub) return returnJsonError(401, "Unauthorized");
      logInfo("analytics_overview", "JWT fallback used");
    }

    const [sales, funnel, channels, customerTypes, countries] = await Promise.all([
      supabase.from("view_sales_analytics").select("*").eq("store_id", store_id),
      supabase.from("view_conversion_funnel").select("*").eq("store_id", store_id),
      supabase.from("view_revenue_by_channel").select("*").eq("store_id", store_id),
      supabase.from("view_customer_type_split").select("*").eq("store_id", store_id),
      supabase.from("view_top_countries").select("*").eq("store_id", store_id)
    ]);

    const duration = performance.now() - start;
    logInfo("analytics_overview", "Fetched all analytics data", { duration_ms: duration });

    return addSecurityHeaders(new Response(JSON.stringify({
      sales: sales.data,
      funnel: funnel.data,
      channels: channels.data,
      customerTypes: customerTypes.data,
      countries: countries.data
    }), {
      headers: { "Content-Type": "application/json" }
    }));
  } catch (err) {
    logError("analytics_overview", err);
    return returnJsonError(500, "Internal server error");
  }
});
