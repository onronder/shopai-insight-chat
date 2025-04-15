// supabase/functions/analytics_sales_overview/index.ts

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
  const timeframe = url.searchParams.get("timeframe") || "last30";
  const view = url.searchParams.get("view") || "daily";

  try {
    logInfo("analytics_sales_overview", "Request started", { path, timeframe, view });

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

    // Calculate range
    const daysMap: Record<string, number> = {
      last7: 7,
      last30: 30,
      last90: 90,
      year: 365,
    };
    const days = daysMap[timeframe] || 30;
    const fromDate = new Date(Date.now() - days * 86400_000);

    const { data, error } = await supabase
      .from("vw_analytics_sales_overview")
      .select("*")
      .eq("store_id", store_id)
      .gte("day", fromDate.toISOString().split("T")[0])
      .order("day", { ascending: true });

    if (error) {
      logError("analytics_sales_overview", error.message, { store_id });
      return addSecurityHeaders(returnJsonError(500, "Query failed"));
    }

    const grouped = (data || []).map((row) => ({
      name:
        view === "weekly"
          ? `Week ${new Date(row.day).getWeek()}`
          : view === "monthly"
          ? new Date(row.day).toLocaleString("default", { month: "short" })
          : row.day,
      total: Number(row.total),
      net: Number(row.net),
      refunds: Number(row.refunds),
      tax: Number(row.tax),
    }));

    logInfo("analytics_sales_overview", "Success", {
      store_id,
      count: grouped.length,
      duration_ms: performance.now() - startTime,
    });

    return addSecurityHeaders(
      new Response(JSON.stringify(grouped), {
        status: 200,
        headers: { "Content-Type": "application/json", ...rate.headers },
      })
    );
  } catch (err) {
    logError("analytics_sales_overview", err, { path });
    return addSecurityHeaders(returnJsonError(500, "Internal Server Error"));
  }
});

// Helper for week numbers
declare global {
  interface Date {
    getWeek(): number;
  }
}
Date.prototype.getWeek = function () {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date as any) - yearStart) / 86400000 + 1) / 7 | 0;
};
