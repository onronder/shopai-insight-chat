
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROUTES } from "@/utils/constants";

// Import refactored components
import { SyncProgress, SyncStatusType } from "@/components/welcome/SyncProgress";
import { FeaturesList } from "@/components/welcome/FeaturesList";
import { SampleQuestions } from "@/components/welcome/SampleQuestions";
import { WelcomeHeader } from "@/components/welcome/WelcomeHeader";
import { NavigationButtons } from "@/components/welcome/NavigationButtons";

// TODO: Replace static or placeholder content with live data

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>({
    orders: "syncing",
    products: "pending",
    customers: "pending",
  });
  
  const [syncProgress, setSyncProgress] = useState(15);
  const [syncComplete, setSyncComplete] = useState(false);
  
  // Initial loading simulation
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(loadingTimer);
  }, []);
  
  // Simulate sync progress
  useEffect(() => {
    if (loading) return;
    
    const timer = setTimeout(() => {
      if (syncProgress >= 100) {
        setSyncComplete(true);
        toast({
          title: "Sync complete",
          description: "Your store data has been successfully imported"
        });
        return;
      }
      
      // Update sync status based on progress
      if (syncProgress > 15 && syncProgress < 40) {
        setSyncStatus(prev => ({ ...prev, orders: "completed", products: "syncing" }));
      } else if (syncProgress >= 40 && syncProgress < 90) {
        setSyncStatus(prev => ({ ...prev, products: "completed", customers: "syncing" }));
      } else if (syncProgress >= 90) {
        setSyncStatus(prev => ({ ...prev, customers: "completed" }));
      }
      
      setSyncProgress(prev => Math.min(prev + 5, 100));
    }, 600);
    
    return () => clearTimeout(timer);
  }, [syncProgress, loading]);
  
  const goToDashboard = () => {
    navigate(ROUTES.DASHBOARD);
  };
  
  const skipAndExplore = () => {
    navigate(ROUTES.DASHBOARD);
  };
  
  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Empty state if store data couldn't be fetched
  if (!storeContext || !storeContext.shopDomain) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <EmptyState
            title="Unable to connect to your store"
            description="We couldn't connect to your Shopify store. Please check your connection and try again."
            actionLabel="Reconnect Store"
            onAction={() => window.location.reload()}
          />
        </div>
      </AppLayout>
    );
  }

  const storeName = storeContext.shopDomain.split('.')[0];

  return (
    <AppLayout>
      <div className="container mx-auto py-8 space-y-8 max-w-4xl">
        <WelcomeHeader storeName={storeName} />
        
        {/* Sync Progress Component */}
        <SyncProgress 
          syncStatus={syncStatus}
          syncProgress={syncProgress}
          syncComplete={syncComplete}
        />
        
        {/* Features List Component */}
        <FeaturesList />
        
        {/* Sample Questions Component */}
        <SampleQuestions />
        
        <Separator className="my-6" />
        
        {/* Navigation Buttons Component */}
        <NavigationButtons
          syncComplete={syncComplete}
          onSkip={skipAndExplore}
          onContinue={goToDashboard}
        />
      </div>
    </AppLayout>
  );
};

export default Welcome;
