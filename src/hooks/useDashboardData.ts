import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

export interface StatData {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: typeof DollarSign | typeof Users | typeof ShoppingCart | typeof TrendingUp
}

export interface SalesData {
  name: string
  sales: number
  target: number
}

export interface ProductData {
  name: string
  value: number
}

export interface AcquisitionData {
  period: string
  new_customers: number
}

export interface ActivityData {
  id: number
  action: string
  details: string
  time: string
}

// Auth header helper
const getAuthHeaders = async () => {
  const session = await supabase.auth.getSession()
  const token = session.data?.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Generic fetch helper
const fetcher = async (url: string) => {
  const headers = await getAuthHeaders()
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return res.json()
}

export const useDashboardData = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<StatData[]>({
    queryKey: ['dashboard_summary'],
    queryFn: () => fetcher('/functions/v1/metrics_dashboard_summary'),
  })

  const { data: sales, isLoading: salesLoading, error: salesError } = useQuery<SalesData[]>({
    queryKey: ['sales_over_time'],
    queryFn: () => fetcher('/functions/v1/metrics_sales_over_time'),
  })

  const { data: products, isLoading: topProductsLoading, error: topProductsError } = useQuery<ProductData[]>({
    queryKey: ['top_products'],
    queryFn: () => fetcher('/functions/v1/metrics_top_products'),
  })

  const { data: acquisition, isLoading: acquisitionLoading, error: acquisitionError } = useQuery<AcquisitionData[]>({
    queryKey: ['customer_acquisition'],
    queryFn: () => fetcher('/functions/v1/metrics_customer_acquisition'),
  })

  const { data: activity, isLoading: feedLoading, error: feedError } = useQuery<ActivityData[]>({
    queryKey: ['activity_feed'],
    queryFn: () => fetcher('/functions/v1/metrics_activity_feed'),
  })

  return {
    stats,
    sales,
    products,
    acquisition,
    activity,
    isLoading:
      statsLoading ||
      salesLoading ||
      topProductsLoading ||
      acquisitionLoading ||
      feedLoading,
    error:
      statsError ||
      salesError ||
      topProductsError ||
      acquisitionError ||
      feedError,
  }
}