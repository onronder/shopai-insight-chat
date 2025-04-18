import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useState } from "react"

export interface SalesOverviewPoint {
  period: string
  revenue: number
  net: number
  refunds: number
  orders: number
}

export interface FunnelStep {
  label: string
  count: number
}

export interface ChannelRevenue {
  channel: string
  value: number
}

export interface CustomerTypeBreakdown {
  type: string
  count: number
}

export interface CountryData {
  country: string
  value: number
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

export const useAnalyticsData = () => {
  const [timeframe, setTimeframe] = useState<string>("last30")
  const [view, setView] = useState<string>("daily")

  const sales = useQuery<SalesOverviewPoint[]>({
    queryKey: ["analytics_sales", timeframe, view],
    queryFn: async () => {
      try {
        const data = await fetcher(`/functions/v1/analytics_sales_overview?timeframe=${timeframe}&view=${view}`)
        
        // Handle different response structures
        if (Array.isArray(data)) {
          return data.map(item => ({
            period: item.period || item.date || item.month || "",
            revenue: typeof item.revenue === 'number' ? item.revenue : parseFloat(item.revenue) || 0,
            net: typeof item.net === 'number' ? item.net : parseFloat(item.net) || 0,
            refunds: typeof item.refunds === 'number' ? item.refunds : parseFloat(item.refunds) || 0,
            orders: typeof item.orders === 'number' ? item.orders : parseInt(item.orders) || 0
          }))
        } else if (data && data.data && Array.isArray(data.data)) {
          // Alternative response structure
          return data.data.map(item => ({
            period: item.period || item.date || item.month || "",
            revenue: typeof item.revenue === 'number' ? item.revenue : parseFloat(item.revenue) || 0,
            net: typeof item.net === 'number' ? item.net : parseFloat(item.net) || 0,
            refunds: typeof item.refunds === 'number' ? item.refunds : parseFloat(item.refunds) || 0,
            orders: typeof item.orders === 'number' ? item.orders : parseInt(item.orders) || 0
          }))
        }
        
        return []
      } catch (error) {
        console.error("Error in analytics_sales_overview:", error)
        throw error
      }
    },
    retry: 2,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  const funnel = useQuery<FunnelStep[]>({
    queryKey: ["analytics_funnel"],
    queryFn: async () => {
      try {
        const data = await fetcher("/functions/v1/analytics_funnel")
        
        // Handle different response structures
        if (Array.isArray(data)) {
          return data.map(item => ({
            label: item.label || item.stage || item.step || "",
            count: typeof item.count === 'number' ? item.count : parseInt(item.count) || 0
          }))
        } else if (data && data.steps && Array.isArray(data.steps)) {
          // Alternative response structure
          return data.steps.map(item => ({
            label: item.label || item.stage || item.step || "",
            count: typeof item.count === 'number' ? item.count : parseInt(item.count) || 0
          }))
        }
        
        return []
      } catch (error) {
        console.error("Error in analytics_funnel:", error)
        throw error
      }
    },
    retry: 2,
    staleTime: 10 * 60 * 1000 // 10 minutes
  })

  const customerTypes = useQuery<CustomerTypeBreakdown[]>({
    queryKey: ["analytics_customer_types"],
    queryFn: async () => {
      try {
        const data = await fetcher("/functions/v1/analytics_customer_types")
        
        // Handle different response structures
        if (Array.isArray(data)) {
          return data.map(item => ({
            type: item.type || item.customer_type || "Unknown",
            count: typeof item.count === 'number' ? item.count : parseInt(item.count) || 0
          }))
        } else if (data && data.types && Array.isArray(data.types)) {
          // Alternative response structure
          return data.types.map(item => ({
            type: item.type || item.customer_type || "Unknown",
            count: typeof item.count === 'number' ? item.count : parseInt(item.count) || 0
          }))
        }
        
        return []
      } catch (error) {
        console.error("Error in analytics_customer_types:", error)
        throw error
      }
    },
    retry: 2,
    staleTime: 10 * 60 * 1000
  })

  const topCountries = useQuery<CountryData[]>({
    queryKey: ["analytics_top_countries"],
    queryFn: async () => {
      try {
        const data = await fetcher("/functions/v1/analytics_top_countries")
        
        // Handle different response structures
        if (Array.isArray(data)) {
          return data.map(item => ({
            country: item.country || "Unknown",
            value: typeof item.value === 'number' ? item.value : 
                  (typeof item.count === 'number' ? item.count : 
                  parseFloat(item.value) || parseInt(item.count) || 0)
          }))
        } else if (data && data.countries && Array.isArray(data.countries)) {
          // Alternative response structure
          return data.countries.map(item => ({
            country: item.country || "Unknown",
            value: typeof item.value === 'number' ? item.value : 
                  (typeof item.count === 'number' ? item.count : 
                  parseFloat(item.value) || parseInt(item.count) || 0)
          }))
        }
        
        return []
      } catch (error) {
        console.error("Error in analytics_top_countries:", error)
        throw error
      }
    },
    retry: 2,
    staleTime: 10 * 60 * 1000
  })

  // Returns a Promise that resolves when all refetches are done
  const refetchAll = async () => {
    try {
      const results = await Promise.all([
        sales.refetch(),
        funnel.refetch(),
        customerTypes.refetch(),
        topCountries.refetch()
      ])
      
      console.log("All analytics data refetched successfully")
      return results
    } catch (error) {
      console.error("Error refetching analytics data:", error)
      throw error
    }
  }

  const isLoading = sales.isLoading || funnel.isLoading || customerTypes.isLoading || topCountries.isLoading
  const isFetching = sales.isFetching || funnel.isFetching || customerTypes.isFetching || topCountries.isFetching
  
  // Aggregate all errors
  const error = sales.error || funnel.error || customerTypes.error || topCountries.error
  const errorMessage = error ? (error instanceof Error ? error.message : "Unknown error") : null

  // Check if we have any data
  const hasData = !!sales.data?.length || !!funnel.data?.length || 
                 !!customerTypes.data?.length || !!topCountries.data?.length

  return {
    isLoading,
    isFetching,
    error,
    errorMessage,
    salesData: sales.data || [],
    funnelData: funnel.data || [],
    customerTypeData: customerTypes.data || [],
    topCountriesData: topCountries.data || [],
    refetch: refetchAll,
    timeframe,
    view,
    setTimeframe: (newTimeframe: string) => setTimeframe(newTimeframe),
    setView: (newView: string) => setView(newView),
    hasData,
    status: {
      sales: sales.status,
      funnel: funnel.status,
      customerTypes: customerTypes.status,
      topCountries: topCountries.status
    }
  }
}