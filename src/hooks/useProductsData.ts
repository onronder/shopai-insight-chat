import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useState } from "react"

export interface VariantSale {
  title: string
  variant_id: string
  price: number
  count: number
  revenue: number
  status: "increased" | "decreased" | "stable"
  change: number
}

export interface InventoryRisk {
  title: string
  variant_id: string
  sku: string
  inventory: number
  risk_type: "overstock" | "understock" | "optimal"
  value: number
}

export interface ReturnRate {
  title: string
  variant_id: string
  return_rate: number
  count: number
  returns: number
}

export interface ProductLifecycle {
  title: string
  variant_id: string
  lifecycle_stage: "new" | "growth" | "mature" | "decline"
  sales_trend: number
  last_ordered: string
}

const getAuthHeaders = async () => {
  const session = await supabase.auth.getSession()
  const token = session.data?.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const fetcher = async (url: string) => {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(url, { headers })
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error")
      throw new Error(`Failed to fetch ${url}: ${res.status} - ${errorText}`)
    }
    
    return res.json()
  } catch (error) {
    console.error(`Error fetching ${url}:`, error)
    throw error
  }
}

export const useProductsData = () => {
  const [timeframe, setTimeframe] = useState<string>("last30")
  const [sortField, setSortField] = useState<string>("revenue")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [riskFilter, setRiskFilter] = useState<string>("all")
  const [minReturnRate, setMinReturnRate] = useState<number>(3)
  const [lifecycleFilter, setLifecycleFilter] = useState<string>("all")

  // Fetch variant sales data
  const variantSales = useQuery<VariantSale[]>({
    queryKey: ["variant_sales", timeframe],
    queryFn: async () => {
      try {
        const data = await fetcher(`/functions/v1/metrics_variant_sales?timeframe=${timeframe}`)
        
        // Handle different response structures
        if (Array.isArray(data)) {
          return data.map(item => ({
            title: item.title || item.product_title || "Unknown Product",
            variant_id: item.variant_id || item.id || "",
            price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
            count: typeof item.count === 'number' ? item.count : parseInt(item.count) || 0,
            revenue: typeof item.revenue === 'number' ? item.revenue : parseFloat(item.revenue) || 0,
            status: (item.status === "increased" || item.status === "decreased" || item.status === "stable") 
              ? item.status 
              : "stable",
            change: typeof item.change === 'number' ? item.change : parseFloat(item.change) || 0
          }))
        } else if (data && data.variants && Array.isArray(data.variants)) {
          // Alternative response structure
          return data.variants.map(item => ({
            title: item.title || item.product_title || "Unknown Product",
            variant_id: item.variant_id || item.id || "",
            price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
            count: typeof item.count === 'number' ? item.count : parseInt(item.count) || 0,
            revenue: typeof item.revenue === 'number' ? item.revenue : parseFloat(item.revenue) || 0,
            status: (item.status === "increased" || item.status === "decreased" || item.status === "stable") 
              ? item.status 
              : "stable",
            change: typeof item.change === 'number' ? item.change : parseFloat(item.change) || 0
          }))
        }
        
        return []
      } catch (error) {
        console.error("Error in metrics_variant_sales:", error)
        throw error
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Fetch inventory risks data
  const inventoryRisks = useQuery<InventoryRisk[]>({
    queryKey: ["inventory_risks", riskFilter],
    queryFn: async () => {
      try {
        const data = await fetcher(`/functions/v1/metrics_inventory_risks?risk_type=${riskFilter === "all" ? "" : riskFilter}`)
        
        // Handle different response structures
        if (Array.isArray(data)) {
          return data.map(item => ({
            title: item.title || item.product_title || "Unknown Product",
            variant_id: item.variant_id || item.id || "",
            sku: item.sku || "",
            inventory: typeof item.inventory === 'number' ? item.inventory : parseInt(item.inventory) || 0,
            risk_type: (item.risk_type === "overstock" || item.risk_type === "understock" || item.risk_type === "optimal") 
              ? item.risk_type 
              : "optimal",
            value: typeof item.value === 'number' ? item.value : parseFloat(item.value) || 0
          }))
        } else if (data && data.risks && Array.isArray(data.risks)) {
          // Alternative response structure
          return data.risks.map(item => ({
            title: item.title || item.product_title || "Unknown Product",
            variant_id: item.variant_id || item.id || "",
            sku: item.sku || "",
            inventory: typeof item.inventory === 'number' ? item.inventory : parseInt(item.inventory) || 0,
            risk_type: (item.risk_type === "overstock" || item.risk_type === "understock" || item.risk_type === "optimal") 
              ? item.risk_type 
              : "optimal",
            value: typeof item.value === 'number' ? item.value : parseFloat(item.value) || 0
          }))
        }
        
        return []
      } catch (error) {
        console.error("Error in metrics_inventory_risks:", error)
        throw error
      }
    },
    retry: 2,
    staleTime: 10 * 60 * 1000 // 10 minutes
  })

  // Fetch return rates data
  const returnRates = useQuery<ReturnRate[]>({
    queryKey: ["return_rates", minReturnRate],
    queryFn: async () => {
      try {
        const data = await fetcher(`/functions/v1/metrics_return_rates?min_return_rate=${minReturnRate}`)
        
        // Handle different response structures
        if (Array.isArray(data)) {
          return data.map(item => ({
            title: item.title || item.product_title || "Unknown Product",
            variant_id: item.variant_id || item.id || "",
            return_rate: typeof item.return_rate === 'number' ? item.return_rate : parseFloat(item.return_rate) || 0,
            count: typeof item.count === 'number' ? item.count : parseInt(item.count) || 0,
            returns: typeof item.returns === 'number' ? item.returns : parseInt(item.returns) || 0
          }))
        } else if (data && data.products && Array.isArray(data.products)) {
          // Alternative response structure
          return data.products.map(item => ({
            title: item.title || item.product_title || "Unknown Product",
            variant_id: item.variant_id || item.id || "",
            return_rate: typeof item.return_rate === 'number' ? item.return_rate : parseFloat(item.return_rate) || 0,
            count: typeof item.count === 'number' ? item.count : parseInt(item.count) || 0,
            returns: typeof item.returns === 'number' ? item.returns : parseInt(item.returns) || 0
          }))
        }
        
        return []
      } catch (error) {
        console.error("Error in metrics_return_rates:", error)
        throw error
      }
    },
    retry: 2,
    staleTime: 15 * 60 * 1000 // 15 minutes
  })

  // Fetch product lifecycle data
  const productLifecycle = useQuery<ProductLifecycle[]>({
    queryKey: ["product_lifecycle", lifecycleFilter],
    queryFn: async () => {
      try {
        const data = await fetcher(`/functions/v1/metrics_product_lifecycle?stage=${lifecycleFilter === "all" ? "" : lifecycleFilter}`)
        
        // Handle different response structures
        if (Array.isArray(data)) {
          return data.map(item => ({
            title: item.title || item.product_title || "Unknown Product",
            variant_id: item.variant_id || item.id || "",
            lifecycle_stage: (item.lifecycle_stage === "new" || item.lifecycle_stage === "growth" || 
                            item.lifecycle_stage === "mature" || item.lifecycle_stage === "decline") 
              ? item.lifecycle_stage 
              : "mature",
            sales_trend: typeof item.sales_trend === 'number' ? item.sales_trend : parseFloat(item.sales_trend) || 0,
            last_ordered: item.last_ordered || "N/A"
          }))
        } else if (data && data.stages && Array.isArray(data.stages)) {
          // Alternative response structure for aggregated data
          const result: ProductLifecycle[] = []
          data.stages.forEach((stage: any) => {
            if (stage.products && Array.isArray(stage.products)) {
              stage.products.forEach((product: any) => {
                result.push({
                  title: product.title || "Unknown Product",
                  variant_id: product.variant_id || product.id || "",
                  lifecycle_stage: stage.stage.toLowerCase() || "mature",
                  sales_trend: typeof product.sales_trend === 'number' ? product.sales_trend : parseFloat(product.sales_trend) || 0,
                  last_ordered: product.last_ordered || "N/A"
                })
              })
            }
          })
          return result
        } else if (data && data.products && Array.isArray(data.products)) {
          // Another alternative structure
          return data.products.map(item => ({
            title: item.title || item.product_title || "Unknown Product",
            variant_id: item.variant_id || item.id || "",
            lifecycle_stage: (item.lifecycle_stage === "new" || item.lifecycle_stage === "growth" || 
                            item.lifecycle_stage === "mature" || item.lifecycle_stage === "decline") 
              ? item.lifecycle_stage 
              : "mature",
            sales_trend: typeof item.sales_trend === 'number' ? item.sales_trend : parseFloat(item.sales_trend) || 0,
            last_ordered: item.last_ordered || "N/A"
          }))
        }
        
        return []
      } catch (error) {
        console.error("Error in metrics_product_lifecycle:", error)
        throw error
      }
    },
    retry: 2,
    staleTime: 15 * 60 * 1000 // 15 minutes
  })

  // Sorting function for variant sales
  const getSortedVariantSales = () => {
    if (!variantSales.data) return []
    
    return [...variantSales.data].sort((a, b) => {
      const aValue = a[sortField as keyof VariantSale]
      const bValue = b[sortField as keyof VariantSale]
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue)
      }
      
      return 0
    })
  }

  // Returns a Promise that resolves when all refetches are done
  const refetchAll = async () => {
    try {
      const results = await Promise.all([
        variantSales.refetch(),
        inventoryRisks.refetch(),
        returnRates.refetch(),
        productLifecycle.refetch()
      ])
      
      console.log("All products data refetched successfully")
      return results
    } catch (error) {
      console.error("Error refetching products data:", error)
      throw error
    }
  }

  const isLoading = variantSales.isLoading || inventoryRisks.isLoading || 
                   returnRates.isLoading || productLifecycle.isLoading
  
  const isFetching = variantSales.isFetching || inventoryRisks.isFetching || 
                    returnRates.isFetching || productLifecycle.isFetching
  
  // Aggregate all errors
  const error = variantSales.error || inventoryRisks.error || 
               returnRates.error || productLifecycle.error
  
  const errorMessage = error ? (error instanceof Error ? error.message : "Unknown error") : null

  // Check if we have any data
  const hasData = !!variantSales.data?.length || !!inventoryRisks.data?.length || 
                 !!returnRates.data?.length || !!productLifecycle.data?.length

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
    setTimeframe: (newTimeframe: string) => setTimeframe(newTimeframe),
    sortField,
    sortDirection,
    setSortField: (field: string) => setSortField(field),
    setSortDirection: (direction: "asc" | "desc") => setSortDirection(direction),
    riskFilter,
    setRiskFilter: (filter: string) => setRiskFilter(filter),
    minReturnRate,
    setMinReturnRate: (rate: number) => setMinReturnRate(rate),
    lifecycleFilter,
    setLifecycleFilter: (filter: string) => setLifecycleFilter(filter),
    hasData,
    status: {
      variantSales: variantSales.status,
      inventoryRisks: inventoryRisks.status,
      returnRates: returnRates.status,
      productLifecycle: productLifecycle.status
    }
  }
}