import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export interface VariantSalesData {
  variant_title: string
  total_sales: number
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
  const topSelling = useQuery<VariantSalesData[]>({
    queryKey: ["variant_sales"],
    queryFn: () => fetcher("/functions/v1/metrics_variant_sales"),
  })

  return {
    topSelling,
    isLoading: topSelling.isLoading,
    error: topSelling.error,
  }
}