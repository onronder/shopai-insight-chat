import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { logInfo, logError } from "../_shared/logging.ts";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!,
);

const SHOPIFY_API_VERSION = Deno.env.get("PROJECT_SHOPIFY_API_VERSION")!;
const context = "shopify_delta_customers";

interface ShopifyCustomer {
  id: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  updated_at: string;
}

serve(async (req: Request): Promise<Response> => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo(context, "Delta customer sync started", { path });

    const { data: stores, error } = await supabase
      .from("shopify_stores")
      .select("id, domain, access_token, sync_finished_at")
      .neq("access_token", null);

    if (error || !stores) {
      logError(context, "Failed to fetch stores", { error });
      return addSecurityHeaders(returnJsonError(500, "Failed to load stores"));
    }

    for (const store of stores) {
      const updatedAt = store.sync_finished_at
        ? `&updated_at_min=${encodeURIComponent(store.sync_finished_at)}`
        : "";

      const baseUrl = `https://${store.domain}/admin/api/${SHOPIFY_API_VERSION}/customers.json?limit=250${updatedAt}`;
      const headers: HeadersInit = {
        "X-Shopify-Access-Token": store.access_token,
        "Content-Type": "application/json",
      };

      let pageUrl: string | null = baseUrl;
      let customerCount = 0;
      const now = new Date().toISOString();

      await supabase
        .from("shopify_stores")
        .update({ sync_started_at: now })
        .eq("id", store.id);

      while (pageUrl) {
        const res: Response = await fetch(pageUrl, { headers });
        if (!res.ok) {
          const errText = await res.text();
          logError(context, "Fetch failed", {
            store: store.domain,
            status: res.status,
            error: errText,
          });
          break;
        }

        const body = await res.json();
        const customers: ShopifyCustomer[] = body.customers ?? [];

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
              shopify_synced_at: now,
              source_updated_at: updated_at ? new Date(updated_at) : null,
            });

          if (upsertError) {
            logError(context, "Customer upsert failed", {
              store: store.domain,
              customer_id: id,
              error: upsertError.message,
            });
          } else {
            customerCount++;
          }
        }

        const linkHeader: string | null = res.headers.get("link");
        const nextUrlMatch: RegExpMatchArray | null = linkHeader ? linkHeader.match(/<([^>]+)>;\s*rel=next/) : null;
        pageUrl = nextUrlMatch ? nextUrlMatch[1] : null;
      }

      await supabase
        .from("shopify_stores")
        .update({ sync_finished_at: new Date().toISOString() })
        .eq("id", store.id);

      logInfo(context, "Store delta customer sync completed", {
        store: store.domain,
        customers_synced: customerCount,
      });
    }

    const duration = performance.now() - startTime;
    logInfo(context, "Full delta sync completed", { duration_ms: duration });

    return addSecurityHeaders(
      new Response("Delta customer sync completed", { status: 200 }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logError(context, message, { path });
    return addSecurityHeaders(
      returnJsonError(500, "Unexpected delta customer sync error"),
    );
  }
});
