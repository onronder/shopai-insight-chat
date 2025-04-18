import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useState, useCallback } from "react"

export interface VariantSalesData {
  variant_title: string
  total_sales: number
}

export interface InventoryRiskItem {
  product_id: string
  product_title: string
  variant_title: string
  risk_type: 'low_stock' | 'overstock' | 'stockout'
  inventory_level: number
  reorder_point?: number
  sales_velocity?: number
}

export interface ReturnRateItem {
  product_id: string
  product_title: string
  orders_count: number
  returns_count: number
  return_rate: number
}

export interface ProductLifecycleItem {
  lifecycle_stage: string
  product_count: number
  revenue_share: number
}

export type Timeframe = 'last_7_days' | 'last_30_days' | 'last_90_days' | 'all'

const getAuthHeaders = async () => {
  const session = await supabase.auth.getSession()
  const token = session.data?.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const fetcher = async (url: string, queryParams?: Record<string, string | number | boolean>) => {
  const headers = await getAuthHeaders()
  
  // Add query parameters if provided
  let finalUrl = url
  if (queryParams && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams()
    Object.entries(queryParams).forEach(([key, value]) => {
      params.append(key, String(value))
    })
    finalUrl = `${url}?${params.toString()}`
  }
  
  const res = await fetch(finalUrl, { headers })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.error || `Failed to fetch ${url}`)
  }
  return res.json()
}

export const useProductsData = () => {
  // State for timeframe selection
  const [timeframe, setTimeframe] = useState<Timeframe>('last_30_days')
  
  // Build query parameters with current timeframe
  const getParams = useCallback(() => ({ timeframe }), [timeframe])
  
  // Fetch top selling product variants
  const topSelling = useQuery<VariantSalesData[]>({
    queryKey: ["variant_sales", timeframe],
    queryFn: () => fetcher("/functions/v1/metrics_variant_sales", getParams()),
  })

  // Fetch inventory risk data
  const inventoryRisks = useQuery<InventoryRiskItem[]>({
    queryKey: ["inventory_risks", timeframe],
    queryFn: () => fetcher("/functions/v1/metrics_inventory_risks", getParams()),
  })

  // Fetch return rate data
  const returnRates = useQuery<ReturnRateItem[]>({
    queryKey: ["return_rates", timeframe],
    queryFn: () => fetcher("/functions/v1/metrics_return_rates", getParams()),
  })

  // Fetch product lifecycle data
  const lifecycle = useQuery<ProductLifecycleItem[]>({
    queryKey: ["product_lifecycle", timeframe],
    queryFn: () => fetcher("/functions/v1/metrics_product_lifecycle", getParams()),
  })

  // Refetch all data with current parameters
  const refetchAll = async () => {
    return Promise.all([
      topSelling.refetch(),
      inventoryRisks.refetch(),
      returnRates.refetch(),
      lifecycle.refetch()
    ])
  }

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe)
  }

  // Check if we have data in any of the queries
  const hasAnyData = 
    (topSelling.data && topSelling.data.length > 0) ||
    (inventoryRisks.data && inventoryRisks.data.length > 0) ||
    (returnRates.data && returnRates.data.length > 0) ||
    (lifecycle.data && lifecycle.data.length > 0)

  // Return data and metadata for all queries
  return {
    data: {
      topSelling: topSelling.data || [],
      inventoryRisks: inventoryRisks.data || [],
      returnRates: returnRates.data || [],
      lifecycle: lifecycle.data || []
    },
    isLoading: 
      topSelling.isLoading || 
      inventoryRisks.isLoading || 
      returnRates.isLoading || 
      lifecycle.isLoading,
    loadingStates: {
      topSelling: topSelling.isLoading,
      inventoryRisks: inventoryRisks.isLoading,
      returnRates: returnRates.isLoading,
      lifecycle: lifecycle.isLoading
    },
    error:
      topSelling.error ||
      inventoryRisks.error ||
      returnRates.error ||
      lifecycle.error,
    errors: {
      topSelling: topSelling.error,
      inventoryRisks: inventoryRisks.error,
      returnRates: returnRates.error,
      lifecycle: lifecycle.error
    },
    refetch: refetchAll,
    timeframe,
    setTimeframe: handleTimeframeChange,
    hasData: hasAnyData
  }
}