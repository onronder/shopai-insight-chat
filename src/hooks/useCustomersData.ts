import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export interface SegmentData {
  segment: string
  customer_count: number
  avg_order_value: number
}

export interface LtvBucket {
  bucket: string
  count: number
}

export interface ChurnCandidate {
  id: string
  email: string
  days_inactive: number
}

export interface RepeatRatio {
  repeat_customers: number
  new_customers: number
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

export const useCustomersData = () => {
  const segments = useQuery<SegmentData[]>({
    queryKey: ["customer_segments"],
    queryFn: () => fetcher("/functions/v1/metrics_customer_segments"),
  })

  const ltv = useQuery<LtvBucket[]>({
    queryKey: ["ltv_distribution"],
    queryFn: () => fetcher("/functions/v1/metrics_ltv_distribution"),
  })

  const churn = useQuery<ChurnCandidate[]>({
    queryKey: ["churn_candidates"],
    queryFn: () => fetcher("/functions/v1/metrics_churn_candidates"),
  })

  const loyalty = useQuery<RepeatRatio>({
    queryKey: ["repeat_ratio"],
    queryFn: () => fetcher("/functions/v1/metrics_repeat_ratio"),
  })

  return {
    segments,
    ltv,
    churn,
    loyalty,
    isLoading:
      segments.isLoading ||
      ltv.isLoading ||
      churn.isLoading ||
      loyalty.isLoading,
    error:
      segments.error ||
      ltv.error ||
      churn.error ||
      loyalty.error,
  }
}