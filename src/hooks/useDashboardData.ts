// File: src/hooks/useDashboardData.ts

import { useQuery } from '@tanstack/react-query';
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import { secureFetch } from '@/lib/secure-fetch';

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

interface RawStatItem {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
}

const fetcher = async <T>(url: string): Promise<T> => {
  const response = await secureFetch(url);
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Failed to fetch ${url}: ${response.status} - ${errorText}`);
  }
  return response.json();
};

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'DollarSign': return DollarSign;
    case 'Users': return Users;
    case 'ShoppingCart': return ShoppingCart;
    case 'TrendingUp': return TrendingUp;
    default: return DollarSign;
  }
};

export const useDashboardData = () => {
  const statsQuery = useQuery<StatData[]>({
    queryKey: ['dashboard_summary'],
    queryFn: async () => {
      const raw: RawStatItem[] = await fetcher('/functions/v1/metrics_dashboard_summary');
      return raw.map(item => ({
        ...item,
        icon: getIconComponent(item.icon),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const salesQuery = useQuery<SalesData[]>({
    queryKey: ['sales_over_time'],
    queryFn: () => fetcher<SalesData[]>('/functions/v1/metrics_sales_over_time'),
    staleTime: 5 * 60 * 1000,
  });

  const productsQuery = useQuery<ProductData[]>({
    queryKey: ['top_products'],
    queryFn: () => fetcher<ProductData[]>('/functions/v1/metrics_top_products'),
    staleTime: 5 * 60 * 1000,
  });

  const acquisitionQuery = useQuery<AcquisitionData[]>({
    queryKey: ['customer_acquisition'],
    queryFn: () => fetcher<AcquisitionData[]>('/functions/v1/metrics_customer_acquisition'),
    staleTime: 5 * 60 * 1000,
  });

  const activityQuery = useQuery<ActivityData[]>({
    queryKey: ['activity_feed'],
    queryFn: () => fetcher<ActivityData[]>('/functions/v1/metrics_activity_feed'),
    staleTime: 5 * 60 * 1000,
  });

  return {
    stats: statsQuery.data || [],
    sales: salesQuery.data || [],
    products: productsQuery.data || [],
    acquisition: acquisitionQuery.data || [],
    activity: activityQuery.data || [],
    isLoading:
      statsQuery.isLoading ||
      salesQuery.isLoading ||
      productsQuery.isLoading ||
      acquisitionQuery.isLoading ||
      activityQuery.isLoading,
    error:
      statsQuery.error ||
      salesQuery.error ||
      productsQuery.error ||
      acquisitionQuery.error ||
      activityQuery.error,
  };
};
