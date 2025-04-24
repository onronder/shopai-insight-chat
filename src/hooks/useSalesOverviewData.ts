// File: src/hooks/useSalesOverviewData.ts

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { secureFetch } from "@/lib/secure-fetch";
import type { Database } from "@/integrations/supabase/types";

type Row = Database["public"]["Views"]["vw_analytics_sales_overview"]["Row"];

export function useSalesOverviewData() {
  return useQuery<Row[], Error>({
    queryKey: ["salesOverview"],
    queryFn: async () => {
      const session = await supabase.auth.getSession();
      const storeId = session.data.session?.user?.id;
      if (!storeId) throw new Error("No store ID found in session");

      const res = await secureFetch(
        `/rest/v1/vw_analytics_sales_overview?store_id=eq.${storeId}&order=day.asc`,
        {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        throw new Error(`Failed to load sales overview: ${res.status} - ${errorText}`);
      }

      const data: Row[] = await res.json();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
