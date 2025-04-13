
import { useState, useEffect } from 'react';
import { 
  topSellingProductsData, 
  inventoryAtRiskData,
  returnRateData,
  variantSalesData,
  productLifecycleData
} from "@/data/product-data";

/**
 * Custom hook for fetching and managing products data
 * TODO: Replace with real API integration when backend is implemented
 */
export const useProductsData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasData, setHasData] = useState(true);
  const [timeframe, setTimeframe] = useState("last30");
  const [retryCounter, setRetryCounter] = useState(0);
  
  const [data, setData] = useState({
    topSellingProductsData,
    inventoryAtRiskData,
    returnRateData,
    variantSalesData,
    productLifecycleData
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
        console.error("Error fetching products data:", err);
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
