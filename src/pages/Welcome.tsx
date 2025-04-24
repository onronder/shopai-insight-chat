// File: src/pages/Welcome.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/EmptyState";
import { SyncProgress, SyncStatusType } from "@/components/welcome/SyncProgress";
import { FeaturesList } from "@/components/welcome/FeaturesList";
import { SampleQuestions } from "@/components/welcome/SampleQuestions";
import { WelcomeHeader } from "@/components/welcome/WelcomeHeader";
import { NavigationButtons } from "@/components/welcome/NavigationButtons";
import { useStoreSyncStatus } from "@/hooks/useStoreSyncStatus";
import { secureFetch } from "@/lib/secure-fetch";
import { ROUTES } from "@/utils/constants";

interface StoreContext {
  shopDomain: string;
  shopName: string;
}

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [storeContext, setStoreContext] = useState<StoreContext | null>(null);
  const [loadingStoreInfo, setLoadingStoreInfo] = useState(true);
  const [syncComplete, setSyncComplete] = useState(false);

  const {
    syncStatus,
    syncStartedAt,
    syncFinishedAt,
    isLoading: syncLoading,
    refetch,
  } = useStoreSyncStatus();

  const isFullySynced =
    syncStatus === "completed" ||
    (syncStartedAt && syncFinishedAt && new Date(syncFinishedAt) > new Date(syncStartedAt));

  const syncProgress = (() => {
    if (!syncStartedAt) return 0;
    if (!syncFinishedAt) return 50;
    return 100;
  })();

  const computedStatus: SyncStatusType = {
    orders: syncProgress === 100 ? "completed" : syncProgress >= 10 ? "syncing" : "pending",
    products: syncProgress === 100 ? "completed" : syncProgress >= 30 ? "syncing" : "pending",
    customers: syncProgress === 100 ? "completed" : syncProgress >= 70 ? "syncing" : "pending",
  };

  useEffect(() => {
    if (isFullySynced && !syncComplete) {
      setSyncComplete(true);
      toast({
        title: "Sync complete",
        description: "Your store data has been successfully imported",
      });
    }
  }, [isFullySynced, syncComplete, toast]);

  useEffect(() => {
    const fetchStoreMeta = async () => {
      try {
        const res = await secureFetch("/rest/v1/stores/meta");
        const json = await res.json();

        if (!json || json.disconnected_at) {
          toast({
            title: "Store Disconnected",
            description: "This store has been disconnected. Please reconnect.",
            variant: "destructive",
          });
          navigate("/shopify-login");
          return;
        }

        const domain = json.shop_domain;
        const shopName = domain?.split(".")[0] || "Your Store";

        setStoreContext({ shopDomain: domain, shopName });
        setLoadingStoreInfo(false);
      } catch (err) {
        console.error("Failed to fetch store metadata", err);
        setLoadingStoreInfo(false);
      }
    };

    fetchStoreMeta();
  }, [navigate, toast]);

  const goToDashboard = () => {
    localStorage.setItem("onboardingCompleted", "true");
    navigate(ROUTES.DASHBOARD);
  };

  const skipAndExplore = () => {
    localStorage.setItem("onboardingCompleted", "true");
    navigate(ROUTES.DASHBOARD);
  };

  if (loadingStoreInfo || syncLoading) {
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

  return (
    <AppLayout>
      <div className="container mx-auto py-8 space-y-8 max-w-4xl">
        <WelcomeHeader storeName={storeContext.shopName} />
        <SyncProgress
          syncStatus={computedStatus}
          syncProgress={syncProgress}
          syncComplete={syncComplete}
        />
        <FeaturesList />
        <SampleQuestions />
        <Separator className="my-6" />
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
