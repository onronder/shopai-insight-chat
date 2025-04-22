import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useState } from "react"

export interface CustomerSegment {
  segment: string
  count: number
  avg_order_value: number
  percentage: number
}

export interface LtvDistribution {
  bucket: string
  count: number
  percentage: number
  min_value: number
  max_value: number
}

export interface ChurnCandidate {
  customer_id: string
  email: string
  days_since_last_order: number
  orders_count: number
  total_spent: number
  risk_score: number
}

export interface RepeatCustomer {
  count: number
  percentage: number
  type: "new" | "repeat"
}

export interface RecentSignup {
  id: string
  first_name: string | null
  last_name: string | null
  created_at: string | null
  first_order_value: number | null
}

const getAuthHeaders = async () => {
  const session = await supabase.auth.getSession()
  const token = session.data?.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const fetcher = async (url: string) => {
  const headers = await getAuthHeaders()
  const res = await fetch(url, { headers })

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error")
    throw new Error(`Failed to fetch ${url}: ${res.status} - ${errorText}`)
  }

  return res.json()
}

export const useCustomersData = () => {
  const [timeframe, setTimeframe] = useState<string>("last30")
  const [minChurnRisk, setMinChurnRisk] = useState<number>(60)

  const segments = useQuery<CustomerSegment[]>({
    queryKey: ["customer_segments", timeframe],
    queryFn: async () => await fetcher(`/functions/v1/metrics_customer_segments?timeframe=${timeframe}`),
  })

  const ltvDistribution = useQuery<LtvDistribution[]>({
    queryKey: ["ltv_distribution", timeframe],
    queryFn: async () => await fetcher(`/functions/v1/metrics_ltv_distribution?timeframe=${timeframe}`),
  })

  const churnCandidates = useQuery<ChurnCandidate[]>({
    queryKey: ["churn_candidates", minChurnRisk],
    queryFn: async () => await fetcher(`/functions/v1/metrics_churn_candidates?min_risk=${minChurnRisk}`),
  })

  const repeatCustomers = useQuery<RepeatCustomer[]>({
    queryKey: ["repeat_customers", timeframe],
    queryFn: async () => await fetcher(`/functions/v1/metrics_repeat_ratio?timeframe=${timeframe}`),
  })

  const recent = useQuery<RecentSignup[]>({
    queryKey: ["recent_signups", timeframe],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vw_customer_acquisition_raw")
        .select("customer_id, period, total_orders, store_id, shopify_customers(first_name,last_name,created_at)")
        .eq("period", timeframe)
        .order("created_at", { foreignTable: "shopify_customers", ascending: false })
        .limit(10)

      if (error) throw error

      return data
        .filter((d) => d.shopify_customers?.first_name || d.shopify_customers?.last_name)
        .map((entry) => ({
          id: entry.customer_id!,
          first_name: entry.shopify_customers?.first_name ?? null,
          last_name: entry.shopify_customers?.last_name ?? null,
          created_at: entry.shopify_customers?.created_at ?? null,
          first_order_value: null,
        }))
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

  const refetchAll = async () => {
    return Promise.all([
      segments.refetch(),
      ltvDistribution.refetch(),
      churnCandidates.refetch(),
      repeatCustomers.refetch(),
      recent.refetch(),
    ])
  }

  const isLoading =
    segments.isLoading ||
    ltvDistribution.isLoading ||
    churnCandidates.isLoading ||
    repeatCustomers.isLoading ||
    recent.isLoading

  const isFetching =
    segments.isFetching ||
    ltvDistribution.isFetching ||
    churnCandidates.isFetching ||
    repeatCustomers.isFetching ||
    recent.isFetching

  const error =
    segments.error ||
    ltvDistribution.error ||
    churnCandidates.error ||
    repeatCustomers.error ||
    recent.error

  const errorMessage = error instanceof Error ? error.message : null

  return {
    isLoading,
    isFetching,
    error,
    errorMessage,
    segmentsData: segments.data || [],
    ltvDistributionData: ltvDistribution.data || [],
    churnCandidatesData: churnCandidates.data || [],
    repeatCustomersData: repeatCustomers.data || [],
    recentSignups: recent.data || [],
    refetch: refetchAll,
    timeframe,
    setTimeframe,
    minChurnRisk,
    setMinChurnRisk,
    hasData:
      !!segments.data?.length ||
      !!ltvDistribution.data?.length ||
      !!churnCandidates.data?.length ||
      !!repeatCustomers.data?.length ||
      !!recent.data?.length,
    status: {
      segments: segments.status,
      ltvDistribution: ltvDistribution.status,
      churnCandidates: churnCandidates.status,
      repeatCustomers: repeatCustomers.status,
      recent: recent.status,
    },
  }
}
