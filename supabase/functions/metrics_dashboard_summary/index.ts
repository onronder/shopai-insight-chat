import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { verifyJWT } from "../_shared/jwt.ts";
import { checkRateLimit, addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

// Supabase admin client
const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

interface DashboardSummaryResponse {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercentage = (value: number): string => {
  return `${value > 0 ? "+" : ""}${value}%`;
};

serve(async (req) => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo("metrics_dashboard_summary", "Request started", { path });

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
      .from("view_dashboard_summary_with_trends")
      .select("*")
      .eq("store_id", store_id)
      .single();

    if (error || !data) {
      logError("metrics_dashboard_summary", error ?? "No data returned", { store_id });
      return addSecurityHeaders(returnJsonError(500, "Failed to fetch dashboard summary"));
    }

    const transformedData: DashboardSummaryResponse[] = [
      {
        title: "Total Revenue",
        value: formatCurrency(data.total_revenue || 0),
        change: formatPercentage(data.revenue_change_pct || 0),
        trend: data.revenue_change_pct >= 0 ? "up" : "down",
        icon: "DollarSign",
      },
      {
        title: "Total Orders",
        value: String(data.total_orders || 0),
        change: formatPercentage(data.orders_change_pct || 0),
        trend: data.orders_change_pct >= 0 ? "up" : "down",
        icon: "ShoppingCart",
      },
      {
        title: "Average Order Value",
        value: formatCurrency(data.avg_order_value || 0),
        change: formatPercentage(data.aov_change_pct || 0),
        trend: data.aov_change_pct >= 0 ? "up" : "down",
        icon: "TrendingUp",
      },
      {
        title: "New Customers",
        value: String(data.new_customers || 0),
        change: formatPercentage(data.customers_change_pct || 0),
        trend: data.customers_change_pct >= 0 ? "up" : "down",
        icon: "Users",
      },
    ];

    logInfo("metrics_dashboard_summary", "Request completed", {
      store_id,
      duration_ms: performance.now() - startTime,
      records: transformedData.length,
    });

    return addSecurityHeaders(
      new Response(JSON.stringify(transformedData), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...rate.headers,
        },
      })
    );
  } catch (err) {
    logError("metrics_dashboard_summary", err, { path });
    return addSecurityHeaders(returnJsonError(500, "Internal Server Error"));
  }
});
