
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";

const AnalyticsPage: React.FC = () => {
  const {
    isLoading,
    error,
    hasData,
    timeframe,
    view,
    setTimeframe,
    setView,
    refetch,
    salesData,
    funnelData,
    revenueByChannelData,
    customerTypeData,
    topCountriesData,
    COLORS
  } = useAnalyticsData();

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
          <Skeleton className="h-80 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <ErrorState
            title="Unable to load analytics data"
            description="There was a problem retrieving your analytics data. Please try again."
            retryLabel="Refresh Data"
            onRetry={refetch}
          />
        </div>
      </AppLayout>
    );
  }

  if (!hasData) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <EmptyState
            title="No analytics data available"
            description="Connect your store or wait for more data to be collected"
            actionLabel="Check data connection"
            onAction={() => console.log("Check data connection clicked")}
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
            <h2 className="text-3xl font-bold tracking-tight">Analytics Overview</h2>
            <p className="text-muted-foreground">Your store performance at a glance</p>
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7">Last 7 days</SelectItem>
              <SelectItem value="last30">Last 30 days</SelectItem>
              <SelectItem value="last90">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Daily, weekly, and monthly sales trends</CardDescription>
            <Tabs value={view} onValueChange={setView}>
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="net" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="refunds" stroke="#ff7300" strokeWidth={2} />
                  <Line type="monotone" dataKey="tax" stroke="#387908" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Sessions to purchase journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={funnelData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
                <div className="border rounded p-2">
                  <div className="font-medium">Sessions → Cart</div>
                  <div className="text-primary font-bold">30%</div>
                </div>
                <div className="border rounded p-2">
                  <div className="font-medium">Cart → Checkout</div>
                  <div className="text-primary font-bold">60%</div>
                </div>
                <div className="border rounded p-2">
                  <div className="font-medium">Checkout → Purchase</div>
                  <div className="text-primary font-bold">55.5%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Channel</CardTitle>
              <CardDescription>Sales distribution across channels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByChannelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {revenueByChannelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Repeat vs New Customers</CardTitle>
              <CardDescription>Customer acquisition and retention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={customerTypeData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {customerTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Countries</CardTitle>
              <CardDescription>Order distribution by country</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCountriesData.map((country, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-6 h-6 mr-2 bg-gray-200 rounded-sm flex items-center justify-center text-xs">
                      {country.name.substring(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{country.name}</span>
                        <span className="text-sm font-medium">{country.value} orders</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${(country.value / topCountriesData[0].value) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>AI-generated insights based on your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Sales are up 24% compared to last month.</span>{" "}
                Your best-performing product category was "Summer Collection" with 45% of total sales. 
                Consider increasing inventory for this category as it's trending upward. 
                There was a noticeable spike in mobile purchases (32% increase), 
                suggesting your recent mobile optimization efforts are paying off.
                Additionally, your customer retention rate improved to 42%, 
                indicating that your loyalty program changes are having a positive impact.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AnalyticsPage;
