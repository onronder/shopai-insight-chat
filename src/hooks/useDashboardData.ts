import { useState, useEffect } from 'react';
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/initAuth';

// Define the data types for better type safety
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

/**
 * Custom hook to fetch and manage all dashboard data
 * Connecting to real Supabase Edge Functions
 */
export const useDashboardData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCounter, setRetryCounter] = useState(0);
  
  const [stats, setStats] = useState<StatData[]>([]);
  const [sales, setSales] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductData[]>([]);
  const [customerAcquisition, setCustomerAcquisition] = useState<AcquisitionData[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityData[]>([]);
  
  // Map icon types for stats data
  const getIconForStats = (iconType: string): typeof DollarSign | typeof Users | typeof ShoppingCart | typeof TrendingUp => {
    switch (iconType) {
      case 'revenue':
        return DollarSign;
      case 'customers':
        return Users;
      case 'orders':
        return ShoppingCart;
      case 'aov':
      default:
        return TrendingUp;
    }
  };

  // Transform customer acquisition data format
  const formatAcquisitionData = (data: any[]): AcquisitionData[] => {
    return data.map(item => ({
      period: item.period,
      new_customers: item.new_customers,
    }));
  };

  // Format product data
  const formatProductData = (data: any[]): ProductData[] => {
    return data.map(item => ({
      name: item.name || item.product_name || 'Unnamed Product',
      value: item.value || item.total_revenue || 0,
    }));
  };

  // Helper to get authentication token for API calls
  const getAuthToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = await getAuthToken();
        
        if (!token) {
          throw new Error('Authentication token not available');
        }
        
        const headers = {
          Authorization: `Bearer ${token}`
        };
        
        const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
        
        // We'll track all fetches to handle loading state properly
        const fetchPromises = [];
        const errors = [];
        
        // TODO: Add support for timeframe filtering (e.g., last 30/60/90 days)
        const statsFetch = fetch(`${SUPABASE_URL}/functions/v1/metrics_dashboard_summary`, { headers })
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch dashboard summary');
            return res.json();
          })
          .then(data => {
            if (data && Array.isArray(data.stats)) {
              const formattedStats = data.stats.map((stat: any) => ({
                title: stat.title,
                value: stat.value,
                change: stat.change || '+0.0%',
                trend: stat.trend || 'up',
                icon: getIconForStats(stat.icon_type || 'default'),
              }));
              setStats(formattedStats);
            }
          })
          .catch(err => {
            console.error("Error fetching stats:", err);
            errors.push(err);
            // Keep existing empty array if there's an error
          });
        
        fetchPromises.push(statsFetch);
        
        // TODO: Add support for timeframe selection and comparison periods
        const salesFetch = fetch(`${SUPABASE_URL}/functions/v1/metrics_sales_over_time`, { headers })
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch sales data');
            return res.json();
          })
          .then(data => {
            if (data && Array.isArray(data)) {
              const formattedSales = data.map((item: any) => ({
                name: item.name || item.day || 'Unknown',
                sales: parseFloat(item.sales || 0),
                target: parseFloat(item.target || 0),
              }));
              setSales(formattedSales);
            }
          })
          .catch(err => {
            console.error("Error fetching sales:", err);
            errors.push(err);
            // Keep existing empty array if there's an error
          });
        
        fetchPromises.push(salesFetch);
        
        // TODO: Add support for filtering by product category and time period
        const productsFetch = fetch(`${SUPABASE_URL}/functions/v1/metrics_top_products`, { headers })
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch top products');
            return res.json();
          })
          .then(data => {
            if (data && Array.isArray(data)) {
              setTopProducts(formatProductData(data));
            }
          })
          .catch(err => {
            console.error("Error fetching products:", err);
            errors.push(err);
            // Keep existing empty array if there's an error
          });
        
        fetchPromises.push(productsFetch);
        
        // TODO: Add support for different acquisition source breakdowns
        const acquisitionFetch = fetch(`${SUPABASE_URL}/functions/v1/metrics_customer_acquisition`, { headers })
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch customer acquisition');
            return res.json();
          })
          .then(data => {
            if (data && Array.isArray(data)) {
              setCustomerAcquisition(formatAcquisitionData(data));
            }
          })
          .catch(err => {
            console.error("Error fetching acquisition:", err);
            errors.push(err);
            // Keep existing empty array if there's an error
          });
        
        fetchPromises.push(acquisitionFetch);
        
        // TODO: Add support for filtering by activity type and timeframe
        const activitiesFetch = fetch(`${SUPABASE_URL}/functions/v1/metrics_activity_feed`, { headers })
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch activities');
            return res.json();
          })
          .then(data => {
            if (data && Array.isArray(data)) {
              const formattedActivities = data.map((item: any, index: number) => ({
                id: item.id || index + 1,
                action: item.action || 'Unknown activity',
                details: item.details || '',
                time: item.time || 'Unknown time',
              }));
              setRecentActivities(formattedActivities);
            }
          })
          .catch(err => {
            console.error("Error fetching activities:", err);
            errors.push(err);
            // Keep existing empty array if there's an error
          });
        
        fetchPromises.push(activitiesFetch);
        
        // Wait for all fetches to complete
        await Promise.allSettled(fetchPromises);
        
        // If we have errors, set the first one
        if (errors.length > 0) {
          setError(errors[0]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error in dashboard data fetching:", err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [retryCounter]);
  
  const refetch = () => {
    setRetryCounter(prev => prev + 1);
  };
  
  const isEmpty = !stats.length && !sales.length && !topProducts.length && !customerAcquisition.length && !recentActivities.length;
  
  return {
    isLoading,
    error,
    refetch,
    stats,
    sales,
    topProducts,
    customerAcquisition,
    recentActivities,
    isEmpty
  };
};
