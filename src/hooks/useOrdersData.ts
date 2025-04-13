
import { useState, useEffect } from 'react';
import { 
  orderVolumeData, 
  orderStatusData, 
  COLORS, 
  aovData, 
  discountedOrdersData, 
  fulfillmentDelaysData 
} from "@/data/order-data";

/**
 * Custom hook for fetching and managing orders data
 * TODO: Replace with real API integration when backend is implemented
 */
export const useOrdersData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeframe, setTimeframe] = useState("last14");
  const [retryCounter, setRetryCounter] = useState(0);
  
  const [orderData, setOrderData] = useState({
    orderVolumeData,
    orderStatusData,
    colors: COLORS,
    aovData,
    discountedOrdersData,
    fulfillmentDelaysData
  });
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // TODO: Replace with actual API calls to backend
        // Simulate API loading delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock data is already set in state initialization
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching orders data:", err);
        setError(err instanceof Error ? err : new Error("Unknown error occurred"));
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [retryCounter, timeframe]);
  
  const refetch = () => {
    setRetryCounter(prev => prev + 1);
  };
  
  return {
    data: orderData,
    isLoading,
    error,
    refetch,
    timeframe,
    setTimeframe
  };
};
