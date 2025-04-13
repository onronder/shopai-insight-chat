import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/dotenv/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const SHOPIFY_API_VERSION = Deno.env.get("PROJECT_SHOPIFY_API_VERSION")!;

serve(async () => {
  const { data: stores, error } = await supabase
    .from("shopify_stores")
    .select("id, domain, access_token")
    .neq("access_token", null);

  if (error) {
    console.error("Failed to load stores:", error.message);
    return new Response("Error loading stores", { status: 500 });
  }

  for (const store of stores) {
    const baseUrl = `https://${store.domain}/admin/api/${SHOPIFY_API_VERSION}/orders.json?status=any&limit=250`;
    const headers = {
      "X-Shopify-Access-Token": store.access_token,
      "Content-Type": "application/json",
    };

    let pageUrl = baseUrl;

    while (pageUrl) {
      const res = await fetch(pageUrl, { headers });
      if (!res.ok) {
        console.error(`[Store ${store.domain}] Fetch failed:`, await res.text());
        break;
      }

      const json = await res.json();
      const orders = json.orders;

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
          line_items
        } = order;

        let customer_id = null;

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
            console.error("Customer upsert error:", customerError.message);
          } else {
            customer_id = customerRecord.id;
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
          })
          .select("id")
          .single();

        if (orderError || !orderRecord) {
          console.error("Order upsert error:", orderError?.message);
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
      }

      const link = res.headers.get("link");
      const nextUrl = link?.match(/<([^>]+)>; rel="next"/)?.[1];
      pageUrl = nextUrl || null;
    }
  }

  return new Response("Order sync completed", { status: 200 });
});
