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
const context = "shopify_sync_orders";

// Correct types
interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  tags: string;
  total_spent: string;
  orders_count: number;
  last_order_created_at: string;
}

interface ShopifyLineItem {
  product_id?: number;
  variant_id?: number;
  title: string;
  sku?: string;
  quantity: number;
  price: string;
  total_discount?: number;
}

interface ShopifyOrder {
  id: number;
  name: string;
  created_at: string;
  processed_at: string;
  updated_at: string;
  total_price: string;
  subtotal_price: string;
  total_discounts: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string;
  billing_address?: { city?: string; province?: string; country?: string };
  shipping_address?: { city?: string; province?: string; country?: string };
  customer?: ShopifyCustomer;
  line_items: ShopifyLineItem[];
}

serve(async () => {
  const startTime = performance.now();

  try {
    logInfo(context, "Sync started");

    const { data: stores, error } = await supabase
      .from("shopify_stores")
      .select("id, domain, access_token")
      .neq("access_token", null);

    if (error || !stores) {
      logError(context, "Failed to fetch stores", { error });
      return addSecurityHeaders(returnJsonError(500, "Error loading stores"));
    }

    for (const store of stores) {
      const now = new Date().toISOString();

      await supabase.from("stores").update({
        sync_status: "syncing",
        sync_started_at: now,
      }).eq("id", store.id);

      try {
        const baseUrl = `https://${store.domain}/admin/api/${SHOPIFY_API_VERSION}/orders.json?status=any&limit=250`;
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
            throw new Error(`Shopify fetch failed: ${errorText}`);
          }

          const jsonData: { orders: ShopifyOrder[] } = await res.json();
          const orders = jsonData.orders;

          for (const order of orders) {
            const {
              id: shopify_order_id,
              name: order_number,
              created_at,
              processed_at,
              updated_at,
              total_price,
              subtotal_price,
              total_discounts,
              currency,
              financial_status,
              fulfillment_status,
              billing_address,
              shipping_address,
              customer,
              line_items,
            } = order;

            let customer_id: string | null = null;
            if (customer?.id) {
              const { data: customerRecord, error: customerError } = await supabase
                .from("shopify_customers")
                .upsert({
                  shopify_customer_id: customer.id.toString(),
                  email: customer.email,
                  first_name: customer.first_name,
                  last_name: customer.last_name,
                  phone: customer.phone,
                  tags: customer.tags || null,
                  total_spent: parseFloat(customer.total_spent ?? "0"),
                  orders_count: customer.orders_count || 0,
                  last_order_at: customer.last_order_created_at || null,
                  store_id: store.id,
                })
                .select("id")
                .single();

              if (!customerError) customer_id = customerRecord?.id;
            }

            const { data: orderRecord, error: orderError } = await supabase
              .from("shopify_orders")
              .upsert({
                shopify_order_id: shopify_order_id.toString(),
                store_id: store.id,
                order_number,
                customer_id,
                total_price: parseFloat(total_price),
                subtotal_price: parseFloat(subtotal_price),
                total_discount: parseFloat(total_discounts),
                currency,
                financial_status,
                fulfillment_status,
                billing_city: billing_address?.city || null,
                billing_state: billing_address?.province || null,
                billing_country: billing_address?.country || null,
                shipping_city: shipping_address?.city || null,
                shipping_state: shipping_address?.province || null,
                shipping_country: shipping_address?.country || null,
                created_at: created_at ? new Date(created_at) : null,
                processed_at: processed_at ? new Date(processed_at) : null,
                shopify_updated_at: updated_at ? new Date(updated_at) : null,
                shopify_synced_at: new Date(),
              })
              .select("id")
              .single();

            if (!orderError && orderRecord) {
              const order_id = orderRecord.id;
              for (const item of line_items) {
                await supabase.from("shopify_order_line_items").upsert({
                  store_id: store.id,
                  order_id,
                  product_id: item.product_id?.toString() || null,
                  variant_id: item.variant_id?.toString() || null,
                  title: item.title,
                  sku: item.sku || null,
                  quantity: item.quantity,
                  price: parseFloat(item.price),
                  discount: item.total_discount ?? 0,
                });
              }
              synced++;
            }
          }

          const linkHeader = res.headers.get("link") as string | null;
          const nextUrlMatch: RegExpMatchArray | null = linkHeader ? linkHeader.match(/<([^>]+)>;\s*rel=next/) : null;
          pageUrl = nextUrlMatch ? nextUrlMatch[1] : null;
        }

        await supabase.from("stores").update({
          sync_status: "completed",
          sync_finished_at: new Date().toISOString(),
        }).eq("id", store.id);

        logInfo(context, "Store sync completed", {
          store: store.domain,
          orders_synced: synced,
        });
      } catch (syncError) {
        const message = syncError instanceof Error ? syncError.message : String(syncError);

        logError(context, "Sync failed for store", {
          error: message,
          store: store.domain,
        });

        await supabase.from("stores").update({
          sync_status: "failed",
          sync_finished_at: new Date().toISOString(),
        }).eq("id", store.id);

        await supabase.from("sync_errors").insert({
          store_id: store.id,
          function: context,
          error: message,
          phase: "sync",
        });
      }
    }

    logInfo(context, "Full order sync completed", {
      duration_ms: performance.now() - startTime,
    });

    return addSecurityHeaders(
      new Response("Shopify order sync completed", { status: 200 }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logError(context, message);
    return addSecurityHeaders(returnJsonError(500, "Order sync failed"));
  }
});
