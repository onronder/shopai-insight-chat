// File: src/hooks/useOrdersData.ts

import { useQuery } from "@tanstack/react-query";
import { secureFetch } from "@/lib/secure-fetch";

export interface SalesOverTime {
  name: string;
  sales: number;
}

export interface OrderStatus {
  status: string;
  count: number;
}

export interface FulfillmentDelay {
  order_id: string;
  delay_days: number;
}

export interface AvgOrderValue {
  value: number;
  currency: string;
}

export interface DiscountedOrder {
  order_id: string;
  discount: number;
  customer: string;
  total: number;
}

export const useOrdersData = () => {
  const sales = useQuery<SalesOverTime[]>({
    queryKey: ["order_sales_over_time"],
    queryFn: async () => {
      const res = await secureFetch("/functions/v1/metrics_sales_over_time");
      if (!res.ok) throw new Error("Failed to fetch sales over time");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const statuses = useQuery<OrderStatus[]>({
    queryKey: ["order_statuses"],
    queryFn: async () => {
      const res = await secureFetch("/functions/v1/metrics_order_statuses");
      if (!res.ok) throw new Error("Failed to fetch order statuses");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const fulfillment = useQuery<FulfillmentDelay[]>({
    queryKey: ["fulfillment_delays"],
    queryFn: async () => {
      const res = await secureFetch("/functions/v1/metrics_fulfillment_delays");
      if (!res.ok) throw new Error("Failed to fetch fulfillment delays");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const aov = useQuery<AvgOrderValue>({
    queryKey: ["avg_order_value"],
    queryFn: async () => {
      const res = await secureFetch("/rest/v1/vw_avg_order_value");
      if (!res.ok) throw new Error("Failed to fetch avg order value");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const discounts = useQuery<DiscountedOrder[]>({
    queryKey: ["discounted_orders"],
    queryFn: async () => {
      const res = await secureFetch("/rest/v1/vw_discounted_orders");
      if (!res.ok) throw new Error("Failed to fetch discounted orders");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: {
      sales: sales.data,
      statuses: statuses.data,
      fulfillment: fulfillment.data,
      aov: aov.data,
      discounts: discounts.data,
    },
    isLoading:
      sales.isLoading ||
      statuses.isLoading ||
      fulfillment.isLoading ||
      aov.isLoading ||
      discounts.isLoading,
    error:
      sales.error ||
      statuses.error ||
      fulfillment.error ||
      aov.error ||
      discounts.error,
    refetch: () => {
      sales.refetch();
      statuses.refetch();
      fulfillment.refetch();
      aov.refetch();
      discounts.refetch();
    },
    timeframe: "last_30_days", // Reserved for filtering
    setTimeframe: () => {}, // Placeholder
  };
};
