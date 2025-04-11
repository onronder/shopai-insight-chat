
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Import data
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
  return (
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
  );
};

export default CustomersPage;
