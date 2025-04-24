// File: src/pages/Analytics.tsx

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { useStoreAccessGuard } from "@/hooks/useStoreAccessGuard";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SyncStatusBanner } from "@/components/common/SyncStatusBanner";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { GeoHeatmapChart, GeoHeatmapPoint } from "@/components/analytics/GeoHeatmapChart";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const currencyFormatter = (value: number) => formatCurrency(value);
const orderFormatter = (value: number) => `${value.toLocaleString()} orders`;

const Analytics: React.FC = () => {
  useStoreAccessGuard();

  const {
    isLoading,
    error,
    salesData,
    funnelData,
    customerTypeData,
    geoHeatmapData,
    refetch,
    hasData
  } = useAnalyticsData();

  const [salesLoading, setSalesLoading] = useState(false);

  const handleRefreshSales = async () => {
    setSalesLoading(true);
    try {
      await refetch();
    } finally {
      setSalesLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <LoadingState message="Loading analytics..." />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <ErrorState 
          title="Failed to load analytics data" 
          description={error.message} 
          action={<Button onClick={() => refetch()}>Retry</Button>}
        />
      </AppLayout>
    );
  }

  if (!hasData) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <EmptyState 
          title="No analytics available" 
          description="We couldn't find any analytics data for this store. This could be because you haven't connected your store yet or because your store doesn't have any orders."
          action={<Button onClick={() => refetch()}>Refresh Data</Button>}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SyncStatusBanner />
      <Tabs defaultValue="sales">
        <TabsList className="mb-4">
          <TabsTrigger value="sales">Sales Overview</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="customers">Customer Types</TabsTrigger>
          <TabsTrigger value="geo">Geo Heatmap</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Revenue, net revenue, and refunds</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefreshSales}
                disabled={salesLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${salesLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              {salesLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <LoadingState message="Refreshing sales data..." />
                </div>
              ) : salesData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-center">
                  <p className="text-muted-foreground">No sales data available for the selected period</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis tickFormatter={currencyFormatter} />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'orders') return [orderFormatter(value), 'Orders'];
                        return [currencyFormatter(value), name === 'revenue' ? 'Total Revenue' : name === 'net' ? 'Net Revenue' : 'Refunds'];
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} name="Total Revenue" />
                    <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} name="Net Revenue" />
                    <Line type="monotone" dataKey="refunds" stroke="#ef4444" strokeWidth={2} name="Refunds" />
                    <Line type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} name="Orders" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel">
          <Card>
            <CardHeader>
              <CardTitle>Funnel Overview</CardTitle>
              <CardDescription>Customer journey from visitors to repeat purchasers</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {funnelData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-center">
                  <p className="text-muted-foreground">No funnel data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value.toLocaleString()} users`, 'Count']} />
                    <Bar dataKey="count" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Types</CardTitle>
              <CardDescription>Breakdown of customer segments by purchase behavior</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {customerTypeData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-center">
                  <p className="text-muted-foreground">No customer type data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerTypeData}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {customerTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value.toLocaleString()} customers`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geo">
          <Card>
            <CardHeader>
              <CardTitle>Geo Heatmap</CardTitle>
              <CardDescription>Order distribution by location</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <GeoHeatmapChart data={geoHeatmapData as GeoHeatmapPoint[]} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Analytics;
