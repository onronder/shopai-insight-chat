
import { useState, useEffect } from 'react';
import { 
  customers, 
  ltvData, 
  recentSignups, 
  actualChurnData,
  projectedChurnData,
  churnData,
  bestCustomers
} from "@/data/customer-data";

/**
 * Custom hook for fetching and managing customers data
 * TODO: Replace with real API integration when backend is implemented
 */
export const useCustomersData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasData, setHasData] = useState(true);
  const [segment, setSegment] = useState("all");
  const [retryCounter, setRetryCounter] = useState(0);
  
  const [data, setData] = useState({
    customers,
    ltvData,
    recentSignups,
    actualChurnData,
    projectedChurnData,
    churnData,
    bestCustomers
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
        console.error("Error fetching customers data:", err);
        setHasError(true);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [retryCounter, segment]);
  
  const handleRetry = () => {
    setRetryCounter(prev => prev + 1);
  };
  
  return {
    isLoading,
    hasData,
    hasError,
    segment,
    setSegment,
    handleRetry,
    ...data
  };
};
