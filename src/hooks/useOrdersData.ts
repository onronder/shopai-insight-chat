
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
  const [hasError, setHasError] = useState(false);
  const [hasData, setHasData] = useState(true);
  const [timeframe, setTimeframe] = useState("last14");
  const [retryCounter, setRetryCounter] = useState(0);
  
  const [data, setData] = useState({
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
      setHasError(false);
      
      try {
        // TODO: Replace with actual API calls to backend
        // Simulate API loading delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Mock data is already set in state initialization
        setHasData(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching orders data:", err);
        setHasError(true);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [retryCounter, timeframe]);
  
  const handleRetry = () => {
    setRetryCounter(prev => prev + 1);
  };
  
  return {
    isLoading,
    hasData,
    hasError,
    timeframe,
    setTimeframe,
    handleRetry,
    ...data
  };
};
