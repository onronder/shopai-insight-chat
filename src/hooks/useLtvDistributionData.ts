// File: src/hooks/useLtvDistributionData.ts

import { useQuery } from "@tanstack/react-query";
import { secureFetch } from "@/lib/secure-fetch";

// Row structure as returned from Supabase view
interface RawLtvRow {
  percentile_rank: number | null;
}

// Final grouped bucket data passed to chart
export type LtvPercentileBucket = {
  bucket: string;
  count: number;
};

// Bucketing helper based on percentile rank
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
      const response = await secureFetch("/rest/v1/vw_ltv_distribution_percentiles?select=percentile_rank");

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Failed to load LTV distribution: ${response.status} - ${errorText}`);
      }

      const data: RawLtvRow[] = await response.json();
      const grouped: Record<string, number> = {};

      for (const row of data) {
        const rank = row.percentile_rank;
        if (rank === null) continue;

        const bucket = getBucket(rank);
        grouped[bucket] = (grouped[bucket] || 0) + 1;
      }

      return Object.entries(grouped).map(([bucket, count]) => ({ bucket, count }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
