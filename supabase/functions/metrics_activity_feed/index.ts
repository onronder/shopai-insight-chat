// File: supabase/functions/metrics_activity_feed/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/dotenv/load.ts";

serve(async (req) => {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("PROJECT_SUPABASE_URL")!,
    Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
  );

  const { data: user, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const store_id = user.user.id;

  // Example: latest 20 orders and customers
  const { data: orders, error: orderErr } = await supabase
    .from("shopify_orders")
    .select("id, shopify_order_id, created_at, total_price")
    .eq("store_id", store_id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: customers, error: customerErr } = await supabase
    .from("shopify_customers")
    .select("id, email, created_at")
    .eq("store_id", store_id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (orderErr || customerErr) {
    return new Response(JSON.stringify({ error: orderErr || customerErr }), { status: 500 });
  }

  const activityFeed = [
    ...orders.map((o) => ({
      id: o.id,
      action: "New Order",
      details: `Order #${o.shopify_order_id} - $${o.total_price}`,
      time: o.created_at
    })),
    ...customers.map((c) => ({
      id: c.id,
      action: "New Customer",
      details: `${c.email} signed up`,
      time: c.created_at
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

  return new Response(JSON.stringify(activityFeed), {
    headers: { "Content-Type": "application/json" },
  });
});
