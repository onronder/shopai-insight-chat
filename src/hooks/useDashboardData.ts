
import { useState, useEffect } from 'react';
import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react';

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
  name: string;
  value: number;
}

export interface ActivityData {
  id: number;
  action: string;
  details: string;
  time: string;
}

// Sample data
const statsSampleData: StatData[] = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "New Customers",
    value: "356",
    change: "+12.2%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Orders",
    value: "1,234",
    change: "+15.8%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Avg. Order Value",
    value: "$165.23",
    change: "-3.1%",
    trend: "down",
    icon: TrendingUp,
  },
];

const salesSampleData: SalesData[] = [
  { name: "Jan", sales: 4000, target: 4400 },
  { name: "Feb", sales: 3000, target: 3800 },
  { name: "Mar", sales: 5000, target: 4600 },
  { name: "Apr", sales: 8000, target: 5000 },
  { name: "May", sales: 6000, target: 5500 },
  { name: "Jun", sales: 9500, target: 6000 },
];

const productsSampleData: ProductData[] = [
  { name: "Organic Cotton T-Shirt", value: 21 },
  { name: "Premium Yoga Mat", value: 18 },
  { name: "Eco-Friendly Water Bottle", value: 16 },
  { name: "Wireless Earbuds", value: 12 },
  { name: "Minimalist Watch", value: 8 },
  { name: "Others", value: 25 },
];

const acquisitionSampleData: AcquisitionData[] = [
  { name: "Social Media", value: 30 },
  { name: "Direct", value: 25 },
  { name: "Organic Search", value: 20 },
  { name: "Referral", value: 15 },
  { name: "Email", value: 10 },
];

const activitiesSampleData: ActivityData[] = [
  {
    id: 1,
    action: "New order #10234",
    details: "Cameron Williamson purchased Premium Yoga Mat",
    time: "Just now",
  },
  {
    id: 2,
    action: "Inventory alert",
    details: "Eco-Friendly Water Bottle (Blue) is low in stock (3 remaining)",
    time: "2 hours ago",
  },
  {
    id: 3,
    action: "New customer",
    details: "Leslie Alexander created an account",
    time: "5 hours ago",
  },
  {
    id: 4,
    action: "Product review",
    details: "Jane Cooper left a 5-star review on Wireless Earbuds",
    time: "Yesterday",
  },
  {
    id: 5,
    action: "Campaign completed",
    details: "Summer Sale email campaign has ended with 24% open rate",
    time: "2 days ago",
  },
];

/**
 * Custom hook to fetch and manage all dashboard data
 * TODO: Replace with real API integration when backend is implemented
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
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // TODO: Replace with actual API calls to backend
        // Simulate API loading delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        setStats(statsSampleData);
        setSales(salesSampleData);
        setTopProducts(productsSampleData);
        setCustomerAcquisition(acquisitionSampleData);
        setRecentActivities(activitiesSampleData);
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [retryCounter]);
  
  const refetch = () => {
    setRetryCounter(prev => prev + 1);
  };
  
  return {
    isLoading,
    error,
    refetch,
    stats,
    sales,
    topProducts,
    customerAcquisition,
    recentActivities,
    isEmpty: !stats.length && !sales.length && !topProducts.length && !customerAcquisition.length && !recentActivities.length
  };
};
