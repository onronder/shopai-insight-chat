// File: supabase/functions/shopify_delta_customers/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const SHOPIFY_API_VERSION = Deno.env.get("PROJECT_SHOPIFY_API_VERSION")!;

serve(async (req: Request): Promise<Response> => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo("shopify_delta_customers", "Sync started", { path });

    const { data: stores, error } = await supabase
      .from("shopify_stores")
      .select("id, domain, access_token, sync_finished_at")
      .neq("access_token", null);

    if (error || !stores) {
      logError("shopify_delta_customers", error ?? "No stores found");
      return addSecurityHeaders(returnJsonError(500, "Failed to load stores"));
    }

    for (const store of stores) {
      const updatedAt = store.sync_finished_at
        ? `&updated_at_min=${encodeURIComponent(store.sync_finished_at)}`
        : "";

      const baseUrl = `https://${store.domain}/admin/api/${SHOPIFY_API_VERSION}/customers.json?limit=250${updatedAt}`;
      const headers = {
        "X-Shopify-Access-Token": store.access_token,
        "Content-Type": "application/json",
      };

      let pageUrl: string | null = baseUrl;
      let customerCount = 0;

      await supabase
        .from("shopify_stores")
        .update({ sync_started_at: new Date().toISOString() })
        .eq("id", store.id);

      while (pageUrl) {
        const res: Response = await fetch(pageUrl, { headers });
        if (!res.ok) {
          const errText = await res.text();
          logError("shopify_delta_customers", errText, { store: store.domain });
          break;
        }

        const json = await res.json();
        const customers = json.customers ?? [];

        for (const c of customers) {
          const { id, email, first_name, last_name, updated_at } = c;

          const { error: upsertError } = await supabase
            .from("shopify_customers")
            .upsert({
              store_id: store.id,
              shopify_customer_id: id.toString(),
              email,
              first_name,
              last_name,
              shopify_synced_at: new Date().toISOString(),
              source_updated_at: updated_at ? new Date(updated_at) : null
            });

          if (upsertError) {
            logError("shopify_delta_customers", upsertError.message, {
              customer_id: id,
              store_id: store.id,
            });
          } else {
            customerCount++;
          }
        }

        const link: string | null = res.headers.get("link");
        const nextUrl: string | undefined = link?.match(/<([^>]+)>; rel="next"/)?.[1];
        pageUrl = nextUrl ?? null;
      }

      await supabase
        .from("shopify_stores")
        .update({ sync_finished_at: new Date().toISOString() })
        .eq("id", store.id);

      logInfo("shopify_delta_customers", "Store sync complete", {
        store: store.domain,
        customerCount,
      });
    }

    logInfo("shopify_delta_customers", "Delta sync completed", {
      duration_ms: performance.now() - startTime,
    });

    return addSecurityHeaders(
      new Response("Delta customer sync completed", { status: 200 })
    );
  } catch (err) {
    logError("shopify_delta_customers", err instanceof Error ? err : new Error("Unknown error"), {
      path
    });
    return addSecurityHeaders(
      returnJsonError(500, "Unexpected error occurred")
    );
  }
});
