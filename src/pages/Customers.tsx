
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

// TODO: Replace static or placeholder content with live data

// TODO: Replace these imports with API calls to fetch customer data from backend
import { 
  customers, 
  ltvData, 
  recentSignups, 
  actualChurnData,
  projectedChurnData,
  churnData,
  bestCustomers
} from "@/data/customer-data";

// Import components
import { CustomerSegmentsTable } from "@/components/customers/CustomerSegmentsTable";
import { LtvDistributionChart } from "@/components/customers/LtvDistributionChart";
import { RecentSignups } from "@/components/customers/RecentSignups";
import { ChurnForecastChart } from "@/components/customers/ChurnForecastChart";
import { BestCustomers } from "@/components/customers/BestCustomers";

const CustomersPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(true);

  // TODO: Replace with actual API data loading and error handling
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Loading state
  if (loading) {
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
          <Select defaultValue="all">
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
            {/* TODO: Replace with dynamic data fetched from backend */}
            <CustomerSegmentsTable customers={customers} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TODO: Replace with dynamic LTV data from backend */}
          <LtvDistributionChart data={ltvData} />
          {/* TODO: Replace with dynamic signup data from backend */}
          <RecentSignups recentSignups={recentSignups} />
          {/* TODO: Replace with dynamic churn data from backend */}
          <ChurnForecastChart 
            actualData={actualChurnData}
            projectedData={projectedChurnData}
            combinedData={churnData}
          />
          {/* TODO: Replace with dynamic best customers data from backend */}
          <BestCustomers customers={bestCustomers} />
        </div>
      </div>
    </AppLayout>
  );
};

export default CustomersPage;
