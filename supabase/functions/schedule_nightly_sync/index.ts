// File: supabase/functions/schedule_nightly_sync/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async () => {
  const context = "schedule_nightly_sync";
  const startTime = performance.now();

  try {
    logInfo(context, "Nightly scheduler started");

    // Get current UTC time
    const now = new Date();

    // Convert to 00:30 in each store's local time
    const { data: stores, error } = await supabase
      .from("stores")
      .select("id, iana_timezone")
      .neq("access_token", null);

    if (error || !stores) {
      logError(context, error || "No stores found");
      return addSecurityHeaders(returnJsonError(500, "Failed to load stores"));
    }

    const triggered: string[] = [];

    for (const store of stores) {
      const zone = store.iana_timezone || "UTC";
      const localNow = new Date(now.toLocaleString("en-US", { timeZone: zone }));

      const localHour = localNow.getHours();
      const localMin = localNow.getMinutes();

      if (localHour === 0 && localMin >= 30 && localMin < 40) {
        // Trigger delta syncs
        await fetch(`${Deno.env.get("PROJECT_PUBLIC_URL")}/functions/v1/shopify_delta_orders`, {
          method: "POST",
          headers: { Authorization: `Bearer ${Deno.env.get("PROJECT_AUTOMATION_TOKEN")}` },
        });
        await fetch(`${Deno.env.get("PROJECT_PUBLIC_URL")}/functions/v1/shopify_delta_products`, {
          method: "POST",
          headers: { Authorization: `Bearer ${Deno.env.get("PROJECT_AUTOMATION_TOKEN")}` },
        });
        triggered.push(store.id);
      }
    }

    logInfo(context, "Nightly syncs triggered", {
      count: triggered.length,
      store_ids: triggered,
      duration_ms: performance.now() - startTime,
    });

    return addSecurityHeaders(new Response(`Triggered for ${triggered.length} stores`, { status: 200 }));
  } catch (err) {
    logError(context, err);
    return addSecurityHeaders(returnJsonError(500, "Unexpected error"));
  }
});
