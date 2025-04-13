import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/dotenv/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const store_id = user.id;

  const { data, error } = await supabase
    .from("vw_variant_sales_summary")
    .select("*")
    .eq("store_id", store_id)
    .order("total_revenue", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});
