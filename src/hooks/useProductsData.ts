import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

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

const getAuthHeaders = async () => {
  const session = await supabase.auth.getSession()
  const token = session.data?.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const fetcher = async (url: string) => {
  const headers = await getAuthHeaders()
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return res.json()
}

export const useProductsData = () => {
  // Fetch top selling product variants
  const topSelling = useQuery<VariantSalesData[]>({
    queryKey: ["variant_sales"],
    queryFn: () => fetcher("/functions/v1/metrics_variant_sales"),
  })

  // Fetch inventory risk data
  const inventoryRisks = useQuery<InventoryRiskItem[]>({
    queryKey: ["inventory_risks"],
    queryFn: () => fetcher("/functions/v1/metrics_inventory_risks"),
  })

  // Fetch return rate data
  const returnRates = useQuery<ReturnRateItem[]>({
    queryKey: ["return_rates"],
    queryFn: () => fetcher("/functions/v1/metrics_return_rates"),
  })

  // Fetch product lifecycle data
  const lifecycle = useQuery<ProductLifecycleItem[]>({
    queryKey: ["product_lifecycle"],
    queryFn: () => fetcher("/functions/v1/metrics_product_lifecycle"),
  })

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
    error:
      topSelling.error ||
      inventoryRisks.error ||
      returnRates.error ||
      lifecycle.error,
    refetch: () => {
      topSelling.refetch();
      inventoryRisks.refetch();
      returnRates.refetch();
      lifecycle.refetch();
    },
    timeframe: "last_30_days", // placeholder
    setTimeframe: () => {} // placeholder
  }
}