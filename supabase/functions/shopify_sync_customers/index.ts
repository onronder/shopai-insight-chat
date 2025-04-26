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
const context = "shopify_sync_customers";

interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  note?: string;
  tags?: string;
  verified_email: boolean;
  accepts_marketing: boolean;
  orders_count: number;
  total_spent: string;
  created_at: string;
  updated_at: string;
}

serve(async (): Promise<Response> => {
  const startTime = performance.now();

  try {
    logInfo(context, "Customer sync started");

    const { data: stores, error: storeError } = await supabase
      .from("shopify_stores")
      .select("id, domain, access_token")
      .neq("access_token", null);

    if (storeError || !stores) {
      logError(context, "Failed to fetch stores", { error: storeError });
      return addSecurityHeaders(returnJsonError(500, "Failed to load stores"));
    }

    for (const store of stores) {
      const now = new Date().toISOString();

      try {
        await supabase
          .from("stores")
          .update({ sync_status: "syncing", sync_started_at: now })
          .eq("id", store.id);

        const baseUrl = `https://${store.domain}/admin/api/${SHOPIFY_API_VERSION}/customers.json?limit=250`;
        const headers: HeadersInit = {
          "X-Shopify-Access-Token": store.access_token,
          "Content-Type": "application/json",
        };

        let pageUrl: string | null = baseUrl;
        let synced = 0;

        while (pageUrl) {
          const res: Response = await fetch(pageUrl, { headers });
          if (!res.ok) {
            const errorText = await res.text();
            logError(context, "Shopify fetch failed", {
              store: store.domain,
              status: res.status,
              error: errorText,
            });

            await supabase.from("sync_errors").insert({
              store_id: store.id,
              function: context,
              error: `Fetch failed: ${res.status} - ${errorText}`,
              phase: "fetch",
            });

            break;
          }

          const body = await res.json();
          const customers: ShopifyCustomer[] = body.customers ?? [];

          for (const customer of customers) {
            const {
              id,
              email,
              first_name,
              last_name,
              phone,
              note,
              tags,
              verified_email,
              accepts_marketing,
              orders_count,
              total_spent,
              created_at,
              updated_at,
            } = customer;

            const { error: upsertError } = await supabase
              .from("shopify_customers")
              .upsert({
                store_id: store.id,
                shopify_customer_id: id.toString(),
                email,
                first_name,
                last_name,
                phone,
                note: note || null,
                tags: tags || null,
                verified_email,
                accepts_marketing,
                orders_count,
                total_spent: parseFloat(total_spent ?? "0"),
                created_at: created_at ? new Date(created_at) : null,
                updated_at: updated_at ? new Date(updated_at) : null,
              });

            if (upsertError) {
              logError(context, "Customer upsert failed", {
                store: store.domain,
                shopify_customer_id: id,
                error: upsertError.message,
              });

              await supabase.from("sync_errors").insert({
                store_id: store.id,
                function: context,
                error: `Upsert failed: ${upsertError.message}`,
                phase: "upsert",
              });

              continue;
            }

            synced++;
          }

          const linkHeader = res.headers.get("link") as string | null;
          const nextUrlMatch: RegExpMatchArray | null = linkHeader ? linkHeader.match(/<([^>]+)>;\s*rel=next/) : null;
          pageUrl = nextUrlMatch ? nextUrlMatch[1] : null;
        }

        await supabase.from("stores")
          .update({ sync_status: "completed", sync_finished_at: new Date().toISOString() })
          .eq("id", store.id);

        logInfo(context, "Store customer sync completed", {
          store: store.domain,
          customers_synced: synced,
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);

        logError(context, "Top-level store error", {
          store: store.domain,
          error: errorMessage,
        });

        await supabase.from("sync_errors").insert({
          store_id: store.id,
          function: context,
          error: errorMessage,
          phase: "top-level",
        });

        await supabase.from("stores")
          .update({ sync_status: "failed", sync_finished_at: new Date().toISOString() })
          .eq("id", store.id);
      }
    }

    logInfo(context, "Full customer sync completed", {
      duration_ms: performance.now() - startTime,
    });

    return addSecurityHeaders(
      new Response("Customer sync complete", { status: 200 }),
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logError(context, errorMessage);
    return addSecurityHeaders(returnJsonError(500, "Customer sync failed"));
  }
});
