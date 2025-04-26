// File: supabase/functions/shopify_plans/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { addSecurityHeaders } from "../_shared/security.ts";
import { logInfo } from "../_shared/logging.ts";

/**
 * GET /shopify_plans
 * Returns static pricing plans offered by the app
 */

const context = "shopify_plans";

serve((req: Request): Response => {
  const path = new URL(req.url).pathname;
  const start = performance.now();

  logInfo(context, "Received request", { path });

  const plans = [
    {
      name: "Basic",
      monthly_price: 14.90,
      yearly_price: 164.90,
      description: "Dashboard, Orders, Products access",
      tier: "basic",
      features: ["Dashboard", "Orders", "Products"],
    },
    {
      name: "Pro",
      monthly_price: 21.90,
      yearly_price: 244.90,
      description: "Everything except AI Assistant",
      tier: "pro",
      features: ["Dashboard", "Orders", "Products", "Customers", "Store Analytics"],
    },
    {
      name: "Pro AI",
      monthly_price: 34.90,
      yearly_price: 400.00,
      description: "Full access including AI Assistant",
      tier: "pro_ai",
      features: [
        "Dashboard",
        "Orders",
        "Products",
        "Customers",
        "Store Analytics",
        "AI Assistant (GPT-4.5 Turbo)",
      ],
    },
  ];

  const duration = performance.now() - start;
  logInfo(context, "Request completed", { duration_ms: duration });

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  return addSecurityHeaders(
    new Response(JSON.stringify(plans), {
      status: 200,
      headers,
    })
  );
});
