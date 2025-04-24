// File: src/hooks/useAnalyticsData.ts

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { secureFetch } from "@/lib/secure-fetch";

export interface SalesOverviewPoint {
  period: string;
  revenue: number;
  net: number;
  refunds: number;
  orders: number;
}

export interface FunnelStep {
  label: string;
  count: number;
}

export interface CustomerTypeBreakdown {
  type: string;
  count: number;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  value: number;
}

// Generic fetcher using secureFetch + typed output
const fetcher = async <T>(url: string): Promise<T> => {
  const res = await secureFetch(url);
  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`Failed to fetch ${url}: ${res.status} - ${errorText}`);
  }
  return res.json();
};

export const useAnalyticsData = () => {
  const [timeframe, setTimeframe] = useState("last30");
  const [view, setView] = useState("daily");

  const sales = useQuery<SalesOverviewPoint[]>({
    queryKey: ["analytics_sales", timeframe, view],
    queryFn: async () => {
      const data = await fetcher<Array<{
        period?: string;
        date?: string;
        month?: string;
        revenue: number;
        net: number;
        refunds: number;
        orders: number;
      }>>(`/functions/v1/analytics_sales_overview?timeframe=${timeframe}&view=${view}`);

      return data.map(item => ({
        period: item.period || item.date || item.month || "",
        revenue: Number(item.revenue),
        net: Number(item.net),
        refunds: Number(item.refunds),
        orders: Number(item.orders),
      }));
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const funnel = useQuery<FunnelStep[]>({
    queryKey: ["analytics_funnel"],
    queryFn: async () => {
      const data = await fetcher<Array<{ label?: string; stage?: string; step?: string; count: number; }>>(
        "/functions/v1/analytics_funnel"
      );

      return data.map(item => ({
        label: item.label || item.stage || item.step || "",
        count: Number(item.count),
      }));
    },
    retry: 2,
    staleTime: 10 * 60 * 1000,
  });

  const customerTypes = useQuery<CustomerTypeBreakdown[]>({
    queryKey: ["analytics_customer_types"],
    queryFn: async () => {
      const data = await fetcher<Array<{ type?: string; customer_type?: string; count: number; }>>(
        "/functions/v1/analytics_customer_types"
      );

      return data.map(item => ({
        type: item.type || item.customer_type || "Unknown",
        count: Number(item.count),
      }));
    },
    retry: 2,
    staleTime: 10 * 60 * 1000,
  });

  const geoHeatmap = useQuery<GeoPoint[]>({
    queryKey: ["analytics_geo_heatmap"],
    queryFn: async () => {
      const data = await fetcher<Array<{ lat: number; lng: number; total_orders?: number; total_revenue?: number; }>>(
        "/functions/v1/analytics_geo_heatmap"
      );

      return data.map(item => ({
        lat: item.lat,
        lng: item.lng,
        value: Number(item.total_orders ?? item.total_revenue ?? 0),
      }));
    },
    retry: 2,
    staleTime: 10 * 60 * 1000,
  });

  const isLoading = sales.isLoading || funnel.isLoading || customerTypes.isLoading || geoHeatmap.isLoading;
  const isFetching = sales.isFetching || funnel.isFetching || customerTypes.isFetching || geoHeatmap.isFetching;
  const error = sales.error || funnel.error || customerTypes.error || geoHeatmap.error;
  const hasData = !!sales.data?.length || !!funnel.data?.length || !!customerTypes.data?.length || !!geoHeatmap.data?.length;

  return {
    isLoading,
    isFetching,
    error,
    salesData: sales.data || [],
    funnelData: funnel.data || [],
    customerTypeData: customerTypes.data || [],
    geoHeatmapData: geoHeatmap.data || [],
    refetch: async () => {
      await Promise.all([
        sales.refetch(),
        funnel.refetch(),
        customerTypes.refetch(),
        geoHeatmap.refetch(),
      ]);
    },
    timeframe,
    view,
    setTimeframe,
    setView,
    hasData,
  };
};
