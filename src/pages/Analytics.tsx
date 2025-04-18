import React, { useState } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import { useAnalyticsData } from "@/hooks/useAnalyticsData"
import { ErrorState } from "@/components/ui/ErrorState"
import { LoadingState } from "@/components/common/LoadingState"
import { EmptyState } from "@/components/ui/EmptyState"
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
} from "recharts"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SyncStatusBanner } from "@/components/common/SyncStatusBanner"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

// Custom tooltip formatter for currency values
const currencyFormatter = (value: number) => formatCurrency(value);

// Custom tooltip formatter for orders
const orderFormatter = (value: number) => `${value.toLocaleString()} orders`;

const Analytics: React.FC = () => {
  const {
    isLoading,
    error,
    errorMessage,
    salesData,
    funnelData,
    customerTypeData,
    topCountriesData,
    refetch,
    hasData,
    timeframe,
    setTimeframe,
    view,
    setView
  } = useAnalyticsData()
  
  // Track which charts are loading independently
  const [salesLoading, setSalesLoading] = useState(false);
  const [funnelLoading, setFunnelLoading] = useState(false);
  const [customerTypesLoading, setCustomerTypesLoading] = useState(false);
  const [countriesLoading, setCountriesLoading] = useState(false);
  
  // Handle individual chart refetches
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
    )
  }

  if (error) {
    return (
      <AppLayout>
        <SyncStatusBanner />
        <ErrorState 
          title="Failed to load analytics data" 
          description={errorMessage || "An unknown error occurred"} 
          action={<Button onClick={() => refetch()}>Retry</Button>}
        />
      </AppLayout>
    )
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
    )
  }

  // View controls for time period
  const viewOptions = [
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" }
  ];

  // Timeframe options
  const timeframeOptions = [
    { label: "Last 7 days", value: "last7" },
    { label: "Last 30 days", value: "last30" },
    { label: "Last 90 days", value: "last90" },
    { label: "Year to date", value: "ytd" },
    { label: "All time", value: "all" }
  ];

  return (
    <AppLayout>
      <SyncStatusBanner />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          <select 
            className="p-2 border rounded"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            {timeframeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select 
            className="p-2 border rounded"
            value={view}
            onChange={(e) => setView(e.target.value)}
          >
            {viewOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
      <Tabs defaultValue="sales">
        <TabsList className="mb-4">
          <TabsTrigger value="sales">Sales Overview</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="customers">Customer Types</TabsTrigger>
          <TabsTrigger value="geo">Top Countries</TabsTrigger>
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
                      label={({type, percent}) => `${type}: ${(percent * 100).toFixed(0)}%`}
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
              <CardTitle>Top Countries</CardTitle>
              <CardDescription>Order distribution by country</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {topCountriesData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-center">
                  <p className="text-muted-foreground">No geographic data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={topCountriesData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="country" width={80} />
                    <Tooltip formatter={(value) => [`${value.toLocaleString()} orders`, 'Orders']} />
                    <Bar dataKey="value" fill="#8b5cf6" label={{ position: 'right' }} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}

export default Analytics