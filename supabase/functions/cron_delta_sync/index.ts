// File: supabase/functions/cron_delta_sync.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const SHOPIFY_API_VERSION = Deno.env.get("PROJECT_SHOPIFY_API_VERSION")!;

serve(async () => {
  const startTime = performance.now();
  const context = "cron_delta_sync";

  try {
    const { data: stores, error } = await supabase
      .from("stores")
      .select("id, domain, access_token, iana_timezone")
      .neq("access_token", null);

    if (error || !stores) {
      logError(context, "Failed to fetch stores", { error });
      return addSecurityHeaders(returnJsonError(500, "Error loading stores"));
    }

    const now = new Date();

    for (const store of stores) {
      try {
        const storeTz = store.iana_timezone || "UTC";
        const nowInStoreTz = new Date(now.toLocaleString("en-US", { timeZone: storeTz }));

        if (!(nowInStoreTz.getHours() === 0 && nowInStoreTz.getMinutes() === 30)) {
          continue; // Skip this store — not 00:30 in their time zone
        }

        logInfo(context, "Triggering delta sync for store", {
          store_id: store.id,
          tz: storeTz,
          local_time: nowInStoreTz.toISOString(),
        });

        await supabase.from("stores").update({
          sync_status: "syncing",
          sync_started_at: new Date().toISOString()
        }).eq("id", store.id);

        // === TRIGGER DELTA SYNC FUNCTIONS ===
        const functionUrls = [
          `/functions/v1/shopify_delta_orders`,
          `/functions/v1/shopify_delta_products`
        ];

        for (const fn of functionUrls) {
          const res = await fetch(`${Deno.env.get("PROJECT_SUPABASE_URL")}${fn}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${Deno.env.get("AUTOMATION_TOKEN")}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ store_id: store.id })
          });

          if (!res.ok) {
            const errText = await res.text();
            logError(context, `Delta function failed: ${fn}`, { store: store.domain, error: errText });

            await supabase.from("sync_errors").insert({
              store_id: store.id,
              type: "cron_delta",
              context: fn,
              message: `Failed with status ${res.status}`,
              payload: { body: errText }
            });
          }
        }

        await supabase.from("stores").update({
          sync_status: "completed",
          sync_finished_at: new Date().toISOString()
        }).eq("id", store.id);

      } catch (storeErr) {
        logError(context, "Store delta sync error", { store: store.domain, error: storeErr });
        await supabase.from("sync_errors").insert({
          store_id: store.id,
          type: "cron_delta",
          context: "global",
          message: storeErr.message || "Unknown error",
          payload: { stack: storeErr.stack }
        });
      }
    }

    logInfo(context, "Cron delta sync completed", {
      duration_ms: performance.now() - startTime
    });

    return addSecurityHeaders(
      new Response("Cron delta sync completed", { status: 200 })
    );
  } catch (err) {
    logError(context, err);
    return addSecurityHeaders(returnJsonError(500, "Cron delta sync failed"));
  }
});
