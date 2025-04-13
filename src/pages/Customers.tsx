
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { CustomerSegmentsTable } from "@/components/customers/CustomerSegmentsTable";
import { LtvDistributionChart } from "@/components/customers/LtvDistributionChart";
import { RecentSignups } from "@/components/customers/RecentSignups";
import { ChurnForecastChart } from "@/components/customers/ChurnForecastChart";
import { BestCustomers } from "@/components/customers/BestCustomers";
import { useCustomersData } from "@/hooks/useCustomersData";

const CustomersPage: React.FC = () => {
  const {
    isLoading,
    hasData,
    hasError,
    segment,
    setSegment,
    handleRetry,
    customers,
    ltvData,
    recentSignups,
    actualChurnData,
    projectedChurnData,
    churnData,
    bestCustomers
  } = useCustomersData();

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-96 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (hasError) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <ErrorState
            title="Unable to load customer data"
            description="There was a problem loading your customer data. Please try again."
            retryLabel="Refresh Data"
            onRetry={handleRetry}
          />
        </div>
      </AppLayout>
    );
  }

  // Empty state if no customer data available
  if (!hasData || customers.length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <EmptyState
            title="No customer data available"
            description="Connect your store to import customer data or add customers manually"
            actionLabel="Connect Store"
            onAction={() => console.log("Connect store clicked")}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Customer Intelligence</h2>
            <p className="text-muted-foreground">Analyze your customer base and behavior patterns</p>
          </div>
          <Select value={segment} onValueChange={setSegment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="high-value">High Value</SelectItem>
              <SelectItem value="repeat">Repeat Buyers</SelectItem>
              <SelectItem value="at-risk">At Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>View and analyze customer segments based on spending behavior</CardDescription>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="high-value">High-Value</TabsTrigger>
                <TabsTrigger value="repeat">Repeat Buyers</TabsTrigger>
                <TabsTrigger value="at-risk">At-Risk</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <CustomerSegmentsTable customers={customers} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LtvDistributionChart data={ltvData} />
          <RecentSignups recentSignups={recentSignups} />
          <ChurnForecastChart 
            actualData={actualChurnData}
            projectedData={projectedChurnData}
            combinedData={churnData}
          />
          <BestCustomers customers={bestCustomers} />
        </div>
      </div>
    </AppLayout>
  );
};

export default CustomersPage;
