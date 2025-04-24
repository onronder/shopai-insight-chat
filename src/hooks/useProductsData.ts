// File: src/hooks/useProductsData.ts

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { secureFetch } from "@/lib/secure-fetch";

export type Timeframe = "last7" | "last14" | "last30" | "last90";

export interface VariantSale {
  title: string;
  variant_id: string;
  price: number;
  count: number;
  revenue: number;
  status: "increased" | "decreased" | "stable";
  change: number;
}

export interface InventoryRisk {
  title: string;
  variant_id: string;
  sku: string;
  inventory: number;
  risk_type: "overstock" | "understock" | "optimal";
  value: number;
}

export interface ReturnRate {
  title: string;
  variant_id: string;
  return_rate: number;
  count: number;
  returns: number;
}

export interface ProductLifecycle {
  title: string;
  variant_id: string;
  lifecycle_stage: "new" | "growth" | "mature" | "decline";
  sales_trend: number;
  last_ordered: string;
}

export const useProductsData = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>("last30");
  const [sortField, setSortField] = useState<keyof VariantSale>("revenue");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [minReturnRate, setMinReturnRate] = useState<number>(3);
  const [lifecycleFilter, setLifecycleFilter] = useState<string>("all");

  const variantSales = useQuery<VariantSale[]>({
    queryKey: ["variant_sales", timeframe],
    queryFn: async () => {
      const res = await secureFetch(`/functions/v1/metrics_variant_sales?timeframe=${timeframe}`);
      if (!res.ok) throw new Error("Failed to fetch variant sales");
      return res.json();
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  const inventoryRisks = useQuery<InventoryRisk[]>({
    queryKey: ["inventory_risks", riskFilter],
    queryFn: async () => {
      const queryParam = riskFilter === "all" ? "" : `?risk_type=${riskFilter}`;
      const res = await secureFetch(`/functions/v1/metrics_inventory_risks${queryParam}`);
      if (!res.ok) throw new Error("Failed to fetch inventory risks");
      return res.json();
    },
    retry: 2,
    staleTime: 10 * 60 * 1000,
  });

  const returnRates = useQuery<ReturnRate[]>({
    queryKey: ["return_rates", minReturnRate],
    queryFn: async () => {
      const res = await secureFetch(`/functions/v1/metrics_return_rates?min_return_rate=${minReturnRate}`);
      if (!res.ok) throw new Error("Failed to fetch return rates");
      return res.json();
    },
    retry: 2,
    staleTime: 15 * 60 * 1000,
  });

  const productLifecycle = useQuery<ProductLifecycle[]>({
    queryKey: ["product_lifecycle", lifecycleFilter],
    queryFn: async () => {
      const queryParam = lifecycleFilter === "all" ? "" : `?stage=${lifecycleFilter}`;
      const res = await secureFetch(`/functions/v1/metrics_product_lifecycle${queryParam}`);
      if (!res.ok) throw new Error("Failed to fetch product lifecycle");
      return res.json();
    },
    retry: 2,
    staleTime: 15 * 60 * 1000,
  });

  const getSortedVariantSales = (): VariantSale[] => {
    if (!variantSales.data) return [];
    return [...variantSales.data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return 0;
    });
  };

  const refetchAll = async () => {
    await Promise.all([
      variantSales.refetch(),
      inventoryRisks.refetch(),
      returnRates.refetch(),
      productLifecycle.refetch(),
    ]);
  };

  const isLoading =
    variantSales.isLoading ||
    inventoryRisks.isLoading ||
    returnRates.isLoading ||
    productLifecycle.isLoading;

  const isFetching =
    variantSales.isFetching ||
    inventoryRisks.isFetching ||
    returnRates.isFetching ||
    productLifecycle.isFetching;

  const error =
    variantSales.error ||
    inventoryRisks.error ||
    returnRates.error ||
    productLifecycle.error;

  const errorMessage =
    error instanceof Error ? error.message : "Unknown error";

  const hasData =
    !!variantSales.data?.length ||
    !!inventoryRisks.data?.length ||
    !!returnRates.data?.length ||
    !!productLifecycle.data?.length;

  return {
    isLoading,
    isFetching,
    error,
    errorMessage,
    variantSalesData: getSortedVariantSales(),
    inventoryRisksData: inventoryRisks.data || [],
    returnRatesData: returnRates.data || [],
    productLifecycleData: productLifecycle.data || [],
    refetch: refetchAll,
    timeframe,
    setTimeframe: (newTimeframe: Timeframe) => setTimeframe(newTimeframe),
    sortField,
    sortDirection,
    setSortField: (field: keyof VariantSale) => setSortField(field),
    setSortDirection: (dir: "asc" | "desc") => setSortDirection(dir),
    riskFilter,
    setRiskFilter,
    minReturnRate,
    setMinReturnRate,
    lifecycleFilter,
    setLifecycleFilter,
    hasData,
    status: {
      variantSales: variantSales.status,
      inventoryRisks: inventoryRisks.status,
      returnRates: returnRates.status,
      productLifecycle: productLifecycle.status,
    },
  };
};
