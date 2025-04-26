// File: supabase/functions/get_current_plan/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { addSecurityHeaders, returnJsonError } from "../_shared/security.ts";
import { logInfo, logError } from "../_shared/logging.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

const context = "get_current_plan";

serve(async (req: Request): Promise<Response> => {
  const path = new URL(req.url).pathname;

  try {
    const sessionToken = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!sessionToken) {
      return returnJsonError(401, "Missing authorization token");
    }

    // Get the user's store_id from session
    const { data: userSession, error: sessionError } = await supabase.auth.getUser(sessionToken);
    if (sessionError || !userSession?.user) {
      return returnJsonError(401, "Invalid session");
    }

    const userId = userSession.user.id;

    // Query the store_plans table
    const { data: plan, error: planError } = await supabase
      .from("store_plans")
      .select("store_id, plan, active, trial_ends_at, subscription_status, billing_interval, billing_on")
      .eq("store_id", userId)
      .maybeSingle();

    if (planError || !plan) {
      return returnJsonError(404, "Billing plan not found");
    }

    // ✅ Log successful fetch
    logInfo(context, "Fetched current billing plan", { store_id: userId, plan: plan.plan });

    return addSecurityHeaders(
      new Response(JSON.stringify(plan), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
  } catch (err) {
    logError(context, err, { path });
    return returnJsonError(500, "Unexpected error fetching billing plan");
  }
});
