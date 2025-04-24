// File: supabase/functions/schedule_nightly_sync/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const PUBLIC_URL = Deno.env.get("PROJECT_PUBLIC_URL")!;
const AUTOMATION_TOKEN = Deno.env.get("PROJECT_AUTOMATION_TOKEN")!;

serve(async (): Promise<Response> => {
  const context = "schedule_nightly_sync";
  const startTime = performance.now();

  try {
    logInfo(context, "Nightly scheduler started");

    const now = new Date();
    const { data: stores, error } = await supabase
      .from("stores")
      .select("id, iana_timezone")
      .neq("access_token", null);

    if (error || !stores) {
      logError(context, error ?? "No stores available");
      return addSecurityHeaders(returnJsonError(500, "Failed to load stores"));
    }

    const triggered: string[] = [];

    for (const store of stores) {
      const zone = store.iana_timezone || "UTC";
      const localNow = new Date(now.toLocaleString("en-US", { timeZone: zone }));
      const hour = localNow.getHours();
      const min = localNow.getMinutes();

      if (hour === 0 && min >= 30 && min < 40) {
        logInfo(context, "Triggering delta sync for store", {
          store_id: store.id,
          tz: zone,
          local_time: localNow.toISOString(),
        });

        for (const fn of ["shopify_delta_orders", "shopify_delta_products"]) {
          const url = `${PUBLIC_URL}/functions/v1/${fn}`;
          const res = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${AUTOMATION_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ store_id: store.id }),
          });

          if (!res.ok) {
            const errText = await res.text();
            logError(context, `Delta function failed: ${fn}`, {
              store_id: store.id,
              status: res.status,
              response: errText,
            });
          }
        }

        triggered.push(store.id);
      }
    }

    logInfo(context, "Nightly syncs completed", {
      triggered: triggered.length,
      store_ids: triggered,
      duration_ms: performance.now() - startTime,
    });

    return addSecurityHeaders(
      new Response(`Triggered for ${triggered.length} stores`, { status: 200 })
    );
  } catch (err) {
    logError(context, err instanceof Error ? err : new Error("Unknown error"));
    return addSecurityHeaders(returnJsonError(500, "Unexpected error during sync scheduling"));
  }
});
