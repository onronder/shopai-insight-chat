import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Row = Database["public"]["Views"]["vw_analytics_sales_overview"]["Row"];

export function useSalesOverviewData() {
  return useQuery({
    queryKey: ["salesOverview"],
    queryFn: async (): Promise<Row[]> => {
      const { data: session } = await supabase.auth.getSession();
      const storeId = session.session?.user?.id;
      if (!storeId) throw new Error("No store ID found in session");

      const { data, error } = await supabase
        .from("vw_analytics_sales_overview")
        .select("*")
        .eq("store_id", storeId)
        .order("day", { ascending: true });

      if (error) {
        console.error("❌ Failed to load sales overview data", error);
        throw error;
      }

      return data;
    },
  });
}

