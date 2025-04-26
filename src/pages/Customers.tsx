// File: src/pages/CustomersPage.tsx

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useCustomersData } from "@/hooks/useCustomersData";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { CustomerSegmentsTable } from "@/components/customers/CustomerSegmentsTable";
import { LtvDistributionChart } from "@/components/customers/LtvDistributionChart";
import { ChurnForecastChart } from "@/components/customers/ChurnForecastChart";
import { BestCustomers } from "@/components/customers/BestCustomers";
import { SyncStatusBanner } from "@/components/common/SyncStatusBanner";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useStoreAccessGuard } from "@/hooks/useStoreAccessGuard";
import { PlanGate } from "@/components/auth/PlanGate";

const Customers: React.FC = () => {
  useStoreAccessGuard();

  const {
    isLoading,
    error,
    segmentsData,
    ltvDistributionData,
    churnCandidatesData,
    repeatCustomersData,
  } = useCustomersData();

  const handleRetry = () => location.reload();

  if (isLoading) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <LoadingState message="Loading customer data..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <ErrorState
          title="Failed to load customer insights"
          description={error.message}
          action={<Button onClick={handleRetry}>Retry</Button>}
        />
      </AppLayout>
    );
  }

  const hasNoData =
    (!segmentsData?.length &&
      !ltvDistributionData?.length &&
      !churnCandidatesData?.length &&
      !repeatCustomersData?.length);

  if (hasNoData) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No customer data available</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find any customer data to display. This could be because you haven't
            connected your store yet or because your store doesn't have any customers.
          </p>
          <Button onClick={handleRetry}>Refresh Data</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SyncStatusBanner />
      <div className="grid gap-4">
        <CustomerSegmentsTable />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LtvDistributionChart data={ltvDistributionData} />
          <ChurnForecastChart data={churnCandidatesData} />
        </div>
        <BestCustomers data={repeatCustomersData} />
      </div>
    </AppLayout>
  );
};

export default function CustomersPage() {
  return (
    <PlanGate required="pro">
      <Customers />
    </PlanGate>
  );
}
