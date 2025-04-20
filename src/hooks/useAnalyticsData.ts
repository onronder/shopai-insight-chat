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

export interface CustomerTypeBreakdown {
  type: string
  count: number
}

export interface GeoPoint {
  lat: number
  lng: number
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
  const [timeframe, setTimeframe] = useState<string>("last30")
  const [view, setView] = useState<string>("daily")

  const sales = useQuery<SalesOverviewPoint[]>({
    queryKey: ["analytics_sales", timeframe, view],
    queryFn: async () => {
      const data = await fetcher(`/functions/v1/analytics_sales_overview?timeframe=${timeframe}&view=${view}`)
      return data.map((item: any) => ({
        period: item.period || item.date || item.month || "",
        revenue: Number(item.revenue),
        net: Number(item.net),
        refunds: Number(item.refunds),
        orders: Number(item.orders)
      }))
    },
    retry: 2,
    staleTime: 5 * 60 * 1000
  })

  const funnel = useQuery<FunnelStep[]>({
    queryKey: ["analytics_funnel"],
    queryFn: async () => {
      const data = await fetcher("/functions/v1/analytics_funnel")
      return data.map((item: any) => ({
        label: item.label || item.stage || item.step || "",
        count: Number(item.count)
      }))
    },
    retry: 2,
    staleTime: 10 * 60 * 1000
  })

  const customerTypes = useQuery<CustomerTypeBreakdown[]>({
    queryKey: ["analytics_customer_types"],
    queryFn: async () => {
      const data = await fetcher("/functions/v1/analytics_customer_types")
      return data.map((item: any) => ({
        type: item.type || item.customer_type || "Unknown",
        count: Number(item.count)
      }))
    },
    retry: 2,
    staleTime: 10 * 60 * 1000
  })

  const geoHeatmap = useQuery<GeoPoint[]>({
    queryKey: ["analytics_geo_heatmap"],
    queryFn: async () => {
      const data = await fetcher("/functions/v1/analytics_geo_heatmap")
      return data.map((d: any) => ({
        lat: Number(d.lat),
        lng: Number(d.lng),
        value: Number(d.total_orders ?? d.total_revenue ?? 0)
      }))
    },
    retry: 2,
    staleTime: 10 * 60 * 1000
  })

  const isLoading = sales.isLoading || funnel.isLoading || customerTypes.isLoading || geoHeatmap.isLoading
  const isFetching = sales.isFetching || funnel.isFetching || customerTypes.isFetching || geoHeatmap.isFetching
  const error = sales.error || funnel.error || customerTypes.error || geoHeatmap.error

  const hasData = !!sales.data?.length || !!funnel.data?.length || !!customerTypes.data?.length || !!geoHeatmap.data?.length

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
        geoHeatmap.refetch()
      ])
    },
    timeframe,
    view,
    setTimeframe,
    setView,
    hasData
  }
}
