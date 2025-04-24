import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { verifyJWT } from "../_shared/jwt.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logError, logInfo } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const start = performance.now();
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");

  let store_id: string | null = null;

  try {
    if (token) {
      const { data: { user }, error: _error } = await supabase.auth.getUser(token);
      if (user?.id) {
        store_id = user.id;
      }
    }

    // Fallback to verifying custom JWT if Supabase getUser failed or token was undefined
    if (!store_id && token) {
      const jwt = await verifyJWT(token);
      if (jwt?.sub) {
        store_id = jwt.sub;
        logInfo("analytics_overview", "JWT fallback used", { store_id });
      }
    }

    if (!store_id) {
      return addSecurityHeaders(returnJsonError(401, "Unauthorized"));
    }

    const [sales, funnel, channels, customerTypes, countries] = await Promise.all([
      supabase.from("view_sales_analytics").select("*").eq("store_id", store_id),
      supabase.from("view_conversion_funnel").select("*").eq("store_id", store_id),
      supabase.from("view_revenue_by_channel").select("*").eq("store_id", store_id),
      supabase.from("view_customer_type_split").select("*").eq("store_id", store_id),
      supabase.from("view_top_countries").select("*").eq("store_id", store_id)
    ]);

    const duration = performance.now() - start;

    logInfo("analytics_overview", "Fetched analytics overview", {
      store_id,
      duration_ms: duration,
    });

    return addSecurityHeaders(
      new Response(
        JSON.stringify({
          sales: sales.data,
          funnel: funnel.data,
          channels: channels.data,
          customerTypes: customerTypes.data,
          countries: countries.data,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );
  } catch (err) {
    logError("analytics_overview", err, { token });
    return addSecurityHeaders(returnJsonError(500, "Internal server error"));
  }
});
