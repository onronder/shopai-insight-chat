// File: src/hooks/useStoreData.ts

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StoreHealthScore {
  overall: number;
  trend: number;
  components: {
    name: string;
    score: number;
    trend?: number;
    issues?: string[];
    opportunities?: string[];
  }[];
}

type WebhookSuccessRow = {
  type: string;
  success_rate: number | null;
};

type FunctionUsageRow = {
  function_name: string;
  success_rate: number | null;
};

type StoreSummaryRow = {
  hours_since_last_sync: number | null;
  recent_errors: number | null;
};

export const useStoreData = () => {
  const fetchStoreHealth = async (): Promise<StoreHealthScore> => {
    const session = await supabase.auth.getSession();
    const token = session.data?.session?.access_token;

    const headers: HeadersInit = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const [summaryRes, webhooksRes, functionsRes] = await Promise.all([
      fetch("/rest/v1/vw_store_health_summary?limit=1", { headers }),
      fetch("/rest/v1/vw_webhook_success_rate?select=type,success_rate", { headers }),
      fetch("/rest/v1/vw_function_usage_summary?select=function_name,success_rate", { headers }),
    ]);

    if (!summaryRes.ok || !webhooksRes.ok || !functionsRes.ok) {
      throw new Error("Failed to load store health data");
    }

    const [summary]: StoreSummaryRow[] = await summaryRes.json();
    const webhooks: WebhookSuccessRow[] = await webhooksRes.json();
    const functions: FunctionUsageRow[] = await functionsRes.json();

    const webhookScore = average(webhooks.map(w => w.success_rate ?? 0));
    const functionScore = average(functions.map(f => f.success_rate ?? 0));
    const freshnessScore = Math.max(0, 100 - Math.min(48, summary?.hours_since_last_sync ?? 0) * 2);
    const errorPenalty = Math.min(100, (summary?.recent_errors ?? 0) * 5);
    const finalScore = Math.round((webhookScore + functionScore + freshnessScore) / 3 - errorPenalty);

    return {
      overall: Math.max(0, finalScore),
      trend: 2,
      components: [
        {
          name: "Webhook Delivery",
          score: Math.round(webhookScore),
          issues: webhookScore < 95 ? ["Webhook delivery rates are below optimal"] : [],
        },
        {
          name: "Function Reliability",
          score: Math.round(functionScore),
          issues: functionScore < 95 ? ["Some backend functions may be erroring"] : [],
        },
        {
          name: "Data Freshness",
          score: freshnessScore,
          issues: freshnessScore < 80 ? ["Data may be stale or sync delayed"] : [],
        },
        {
          name: "System Stability",
          score: Math.max(0, 100 - errorPenalty),
          issues: summary?.recent_errors && summary.recent_errors > 0
            ? [`${summary.recent_errors} recent errors`]
            : [],
        },
      ],
    };
  };

  return useQuery<StoreHealthScore>({
    queryKey: ["store_health_data"],
    queryFn: fetchStoreHealth,
  });
};

function average(values: number[]): number {
  if (!values.length) return 100;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
