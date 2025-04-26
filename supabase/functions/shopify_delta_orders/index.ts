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
const context = "shopify_delta_orders";

interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface ShopifyLineItem {
  title: string;
  quantity: number;
  price: string;
  total_discount?: number;
}

interface ShopifyOrder {
  id: number;
  created_at: string;
  processed_at: string;
  total_price: string;
  subtotal_price: string;
  total_discounts: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string;
  customer?: ShopifyCustomer;
  line_items: ShopifyLineItem[];
}

serve(async (req: Request): Promise<Response> => {
  const startTime = performance.now();
  const path = new URL(req.url).pathname;

  try {
    logInfo(context, "Delta sync started", { path });

    const { data: stores, error } = await supabase
      .from("shopify_stores")
      .select("id, domain, access_token, sync_finished_at")
      .neq("access_token", null);

    if (error || !stores) {
      logError(context, "Failed to fetch stores", { error });
      return addSecurityHeaders(returnJsonError(500, "Error loading stores"));
    }

    for (const store of stores) {
      const updatedAt = store.sync_finished_at
        ? `&updated_at_min=${encodeURIComponent(store.sync_finished_at)}`
        : "";

      const baseUrl = `https://${store.domain}/admin/api/${SHOPIFY_API_VERSION}/orders.json?status=any&limit=250${updatedAt}`;
      const headers: HeadersInit = {
        "X-Shopify-Access-Token": store.access_token,
        "Content-Type": "application/json",
      };

      let pageUrl: string | null = baseUrl;
      let orderCount = 0;

      await supabase
        .from("shopify_stores")
        .update({ sync_started_at: new Date().toISOString() })
        .eq("id", store.id);

      while (pageUrl) {
        const res: Response = await fetch(pageUrl, { headers });
        if (!res.ok) {
          const errText = await res.text();
          logError(context, "Shopify fetch failed", {
            store: store.domain,
            status: res.status,
            error: errText,
          });
          break;
        }

        const body = await res.json();
        const orders: ShopifyOrder[] = body.orders ?? [];

        for (const order of orders) {
          const {
            id: shopify_order_id,
            created_at,
            processed_at,
            total_price,
            subtotal_price,
            total_discounts,
            currency,
            financial_status,
            fulfillment_status,
            customer,
            line_items,
          } = order;

          let customer_id: string | null = null;

          if (customer && customer.id) {
            const { data: customerRecord, error: customerError } = await supabase
              .from("shopify_customers")
              .upsert({
                shopify_customer_id: customer.id.toString(),
                email: customer.email,
                first_name: customer.first_name,
                last_name: customer.last_name,
                store_id: store.id,
              })
              .select("id")
              .single();

            if (customerError) {
              logError(context, "Customer upsert failed", {
                customer_id: customer.id,
                store_id: store.id,
                error: customerError.message,
              });
            } else {
              customer_id = customerRecord?.id;
            }
          }

          const { data: orderRecord, error: orderError } = await supabase
            .from("shopify_orders")
            .upsert({
              shopify_order_id: shopify_order_id.toString(),
              store_id: store.id,
              customer_id,
              total_price: parseFloat(total_price),
              subtotal_price: parseFloat(subtotal_price),
              total_discount: parseFloat(total_discounts),
              currency,
              financial_status,
              fulfillment_status,
              created_at: created_at ? new Date(created_at) : null,
              processed_at: processed_at ? new Date(processed_at) : null,
              shopify_synced_at: new Date(),
            })
            .select("id")
            .single();

          if (!orderRecord || orderError) {
            logError(context, "Order upsert failed", {
              order_id: shopify_order_id,
              store_id: store.id,
              error: orderError?.message,
            });
            continue;
          }

          const order_id = orderRecord.id;

          for (const item of line_items) {
            await supabase.from("shopify_order_line_items").upsert({
              store_id: store.id,
              order_id,
              product_id: null,
              variant_id: null,
              title: item.title,
              quantity: item.quantity,
              price: parseFloat(item.price),
              discount: item.total_discount ?? 0,
            });
          }

          orderCount++;
        }

        const linkHeader = res.headers.get("link") as string | null;
        const nextUrlMatch: RegExpMatchArray | null = linkHeader ? linkHeader.match(/<([^>]+)>;\s*rel=next/) : null;
        pageUrl = nextUrlMatch ? nextUrlMatch[1] : null;
      }

      await supabase
        .from("shopify_stores")
        .update({ sync_finished_at: new Date().toISOString() })
        .eq("id", store.id);

      logInfo(context, "Store delta sync completed", {
        store: store.domain,
        orders_synced: orderCount,
      });
    }

    logInfo(context, "All delta syncs completed", {
      duration_ms: performance.now() - startTime,
    });

    return addSecurityHeaders(
      new Response("Delta order sync completed", { status: 200 }),
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logError(context, message, { path });
    return addSecurityHeaders(returnJsonError(500, "Unexpected delta sync error"));
  }
});
