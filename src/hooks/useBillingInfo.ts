import { useQuery } from "@tanstack/react-query";
import { secureFetch } from "@/lib/secure-fetch";

export interface BillingInfo {
  store_id: string;
  plan: "basic" | "pro" | "pro_ai";
  trial_ends_at: string | null;
  subscription_created_at: string | null;
  subscription_status: "active" | "cancelled" | "pending" | null;
  billing_interval: "monthly" | "annual" | null;
  billing_on: string | null;
}

export function useBillingInfo() {
  return useQuery<BillingInfo | null, Error>({
    queryKey: ["billingInfo"],
    queryFn: async () => {
      const res = await secureFetch("/rest/v1/store_plans?select=store_id,plan,trial_ends_at,subscription_created_at,subscription_status,billing_interval,billing_on&limit=1");
      if (!res.ok) throw new Error("Failed to fetch billing info");
      const [data] = await res.json();
      return data || null;
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}
