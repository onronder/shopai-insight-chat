import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Raw view type from Supabase
type RawLtvRow = Database["public"]["Views"]["vw_ltv_distribution_percentiles"]["Row"];

// Final grouped bucket data passed to chart
export type LtvPercentileBucket = {
  bucket: string;
  count: number;
};

// Bucketing helper
const getBucket = (rank: number): string => {
  if (rank < 20) return "$0–99";
  if (rank < 40) return "$100–249";
  if (rank < 60) return "$250–499";
  if (rank < 80) return "$500–999";
  return "$1000+";
};

export function useLtvDistributionData() {
  return useQuery<LtvPercentileBucket[], Error>({
    queryKey: ["ltv-distribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vw_ltv_distribution_percentiles")
        .select("percentile_rank");

      if (error) throw error;
      if (!data) return [];

      const grouped: Record<string, number> = {};

      for (const row of data) {
        const bucket = getBucket(row.percentile_rank);
        grouped[bucket] = (grouped[bucket] || 0) + 1;
      }

      return Object.entries(grouped).map(([bucket, count]) => ({ bucket, count }));
    },
  });
}
