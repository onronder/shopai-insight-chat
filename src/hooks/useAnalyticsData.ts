
import { useState, useEffect } from 'react';

const salesData = [
  { name: "Jan", total: 2400, net: 2000, refunds: 400, tax: 200 },
  { name: "Feb", total: 1398, net: 1100, refunds: 298, tax: 150 },
  { name: "Mar", total: 9800, net: 8900, refunds: 900, tax: 650 },
  { name: "Apr", total: 3908, net: 3500, refunds: 408, tax: 320 },
  { name: "May", total: 4800, net: 4200, refunds: 600, tax: 450 },
  { name: "Jun", total: 3800, net: 3300, refunds: 500, tax: 380 },
];

const funnelData = [
  { name: "Sessions", value: 10000 },
  { name: "Cart", value: 3000 },
  { name: "Checkout", value: 1800 },
  { name: "Purchase", value: 1000 },
];

const revenueByChannelData = [
  { name: "Online Store", value: 65 },
  { name: "POS", value: 15 },
  { name: "Mobile App", value: 10 },
  { name: "Social", value: 10 },
];

const customerTypeData = [
  { name: "New Customers", value: 65 },
  { name: "Repeat Customers", value: 35 },
];

const topCountriesData = [
  { name: "United States", value: 145 },
  { name: "United Kingdom", value: 87 },
  { name: "Canada", value: 62 },
  { name: "Australia", value: 43 },
  { name: "Germany", value: 30 },
];

/**
 * Custom hook for fetching and managing analytics data
 * TODO: Replace with real API integration when backend is implemented
 */
export const useAnalyticsData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasData, setHasData] = useState(true);
  const [timeframe, setTimeframe] = useState("last30");
  const [view, setView] = useState("daily");
  const [retryCounter, setRetryCounter] = useState(0);
  
  const [data, setData] = useState({
    salesData,
    funnelData,
    revenueByChannelData,
    customerTypeData,
    topCountriesData,
    COLORS: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]
  });
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // TODO: Replace with actual API calls to backend
        // Simulate API loading delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Mock data is already set in state initialization
        setHasData(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [retryCounter, timeframe, view]);
  
  const refetch = () => {
    setRetryCounter(prev => prev + 1);
  };
  
  return {
    isLoading,
    error,
    hasData,
    timeframe,
    view,
    setTimeframe,
    setView,
    refetch,
    ...data
  };
};
