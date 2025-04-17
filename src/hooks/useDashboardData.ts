// src/hooks/useDashboardData.ts
import { useQuery } from '@tanstack/react-query'
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

// Define interfaces for each component's data requirements
export interface StatData {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: typeof DollarSign | typeof Users | typeof ShoppingCart | typeof TrendingUp;
}

export interface SalesData {
  name: string;
  sales: number;
  target: number;
}

export interface ProductData {
  name: string;
  value: number;
}

export interface AcquisitionData {
  period: string;
  new_customers: number;
}

export interface ActivityData {
  id: number;
  action: string;
  details: string;
  time: string;
}

// Auth header helper
const getAuthHeaders = async () => {
  const session = await supabase.auth.getSession()
  const token = session.data?.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Generic fetch helper with better error handling
const fetcher = async (url: string) => {
  try {
    const headers = await getAuthHeaders()
    const res = await fetch(url, { headers })
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch ${url}: ${res.status} ${errorText}`);
    }
    
    return res.json()
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
}

// Icon mapping helper
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'DollarSign':
      return DollarSign;
    case 'Users':
      return Users;
    case 'ShoppingCart':
      return ShoppingCart;
    case 'TrendingUp':
      return TrendingUp;
    default:
      return DollarSign;
  }
};

export const useDashboardData = () => {
  // Fetch dashboard statistics
  const statsQuery = useQuery({
    queryKey: ['dashboard_summary'],
    queryFn: async () => {
      const data = await fetcher('/functions/v1/metrics_dashboard_summary');
      
      // Transform the data to ensure icon is a component, not a string
      return data.map((item: any) => ({
        ...item,
        icon: getIconComponent(item.icon)
      })) as StatData[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch sales time-series data
  const salesQuery = useQuery({
    queryKey: ['sales_over_time'],
    queryFn: () => fetcher('/functions/v1/metrics_sales_over_time') as Promise<SalesData[]>,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch top products data
  const productsQuery = useQuery({
    queryKey: ['top_products'],
    queryFn: () => fetcher('/functions/v1/metrics_top_products') as Promise<ProductData[]>,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch customer acquisition data - using the existing endpoint for now
  const acquisitionQuery = useQuery({
    queryKey: ['customer_acquisition'],
    queryFn: () => fetcher('/functions/v1/metrics_customer_acquisition') as Promise<AcquisitionData[]>,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch activity feed data - using the existing endpoint for now
  const activityQuery = useQuery({
    queryKey: ['activity_feed'],
    queryFn: () => fetcher('/functions/v1/metrics_activity_feed') as Promise<ActivityData[]>,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Return the data and metadata
  return {
    stats: statsQuery.data || [],
    sales: salesQuery.data || [],
    products: productsQuery.data || [],
    acquisition: acquisitionQuery.data || [],
    activity: activityQuery.data || [],
    
    // Combined loading state
    isLoading: 
      statsQuery.isLoading || 
      salesQuery.isLoading || 
      productsQuery.isLoading || 
      acquisitionQuery.isLoading || 
      activityQuery.isLoading,
    
    // Combined error
    error: 
      statsQuery.error || 
      salesQuery.error || 
      productsQuery.error || 
      acquisitionQuery.error || 
      activityQuery.error,
  };
};