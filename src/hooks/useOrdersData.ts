import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export interface SalesOverTime {
  name: string
  sales: number
}

export interface OrderStatus {
  status: string
  count: number
}

export interface FulfillmentDelay {
  order_id: string
  delay_days: number
}

export interface AvgOrderValue {
  value: number
  currency: string
}

export interface DiscountedOrder {
  order_id: string
  discount: number
  customer: string
  total: number
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

export const useOrdersData = () => {
  const sales = useQuery<SalesOverTime[]>({
    queryKey: ["order_sales_over_time"],
    queryFn: () => fetcher("/functions/v1/metrics_sales_over_time")
  })

  const statuses = useQuery<OrderStatus[]>({
    queryKey: ["order_statuses"],
    queryFn: () => fetcher("/functions/v1/metrics_order_statuses")
  })

  const fulfillment = useQuery<FulfillmentDelay[]>({
    queryKey: ["fulfillment_delays"],
    queryFn: () => fetcher("/functions/v1/metrics_fulfillment_delays")
  })

  const aov = useQuery<AvgOrderValue>({
    queryKey: ["avg_order_value"],
    queryFn: () => fetcher("/rest/v1/vw_avg_order_value")
  })

  const discounts = useQuery<DiscountedOrder[]>({
    queryKey: ["discounted_orders"],
    queryFn: () => fetcher("/rest/v1/vw_discounted_orders")
  })

  return {
    data: {
      sales: sales.data,
      statuses: statuses.data,
      fulfillment: fulfillment.data,
      aov: aov.data,
      discounts: discounts.data
    },
    isLoading: sales.isLoading || statuses.isLoading || fulfillment.isLoading || aov.isLoading || discounts.isLoading,
    error: sales.error || statuses.error || fulfillment.error || aov.error || discounts.error,
    refetch: () => {
      sales.refetch()
      statuses.refetch()
      fulfillment.refetch()
      aov.refetch()
      discounts.refetch()
    },
    timeframe: "last_30_days", // reserved for filtering if needed
    setTimeframe: () => {} // placeholder
  }
}