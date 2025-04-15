import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

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
  const headers = await getAuthHeaders()
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return res.json()
}

export const useAnalyticsData = () => {
  const sales = useQuery<SalesOverviewPoint[]>({
    queryKey: ["analytics_sales"],
    queryFn: () => fetcher("/functions/v1/analytics_sales_overview")
  })

  const funnel = useQuery<FunnelStep[]>({
    queryKey: ["analytics_funnel"],
    queryFn: () => fetcher("/functions/v1/analytics_funnel")
  })

  const customerTypes = useQuery<CustomerTypeBreakdown[]>({
    queryKey: ["analytics_customer_types"],
    queryFn: () => fetcher("/functions/v1/analytics_customer_types")
  })

  const topCountries = useQuery<CountryData[]>({
    queryKey: ["analytics_top_countries"],
    queryFn: () => fetcher("/functions/v1/analytics_top_countries")
  })

  return {
    isLoading: sales.isLoading || funnel.isLoading || customerTypes.isLoading || topCountries.isLoading,
    error: sales.error || funnel.error || customerTypes.error || topCountries.error,
    salesData: sales.data || [],
    funnelData: funnel.data || [],
    customerTypeData: customerTypes.data || [],
    topCountriesData: topCountries.data || [],
    refetch: () => {
      sales.refetch()
      funnel.refetch()
      customerTypes.refetch()
      topCountries.refetch()
    },
    timeframe: "last30", // placeholder
    view: "daily",       // placeholder
    setTimeframe: () => {},
    setView: () => {},
    hasData: !!sales.data?.length
  }
}