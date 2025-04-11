
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, ShoppingCart, DollarSign, Clock } from "lucide-react";
import { useStoreData } from "@/hooks/useStoreData";
import { ChartWrapper } from "@/components/charts/ChartWrapper";
import { LoadingState } from "@/components/common/LoadingState";
import { CHART_COLORS } from "@/utils/constants";
import { formatCurrency } from "@/utils/formatters";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

// TODO: Replace this static data with API calls to fetch actual dashboard stats
const statsData = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "New Customers",
    value: "356",
    change: "+12.2%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Orders",
    value: "1,234",
    change: "+15.8%",
    trend: "up",
    icon: ShoppingCart,
  },
  {
    title: "Avg. Order Value",
    value: "$165.23",
    change: "-3.1%",
    trend: "down",
    icon: TrendingUp,
  },
];

// TODO: Replace with API call to fetch sales data
const salesData = [
  { name: "Jan", sales: 4000, target: 4400 },
  { name: "Feb", sales: 3000, target: 3800 },
  { name: "Mar", sales: 5000, target: 4600 },
  { name: "Apr", sales: 8000, target: 5000 },
  { name: "May", sales: 6000, target: 5500 },
  { name: "Jun", sales: 9500, target: 6000 },
];

// TODO: Replace with API call to fetch top product data
const topProductsData = [
  { name: "Organic Cotton T-Shirt", value: 21 },
  { name: "Premium Yoga Mat", value: 18 },
  { name: "Eco-Friendly Water Bottle", value: 16 },
  { name: "Wireless Earbuds", value: 12 },
  { name: "Minimalist Watch", value: 8 },
  { name: "Others", value: 25 },
];

// TODO: Replace with API call to fetch customer acquisition data
const customerAcquisitionData = [
  { name: "Social Media", value: 30 },
  { name: "Direct", value: 25 },
  { name: "Organic Search", value: 20 },
  { name: "Referral", value: 15 },
  { name: "Email", value: 10 },
];

// TODO: Replace with API call to fetch recent activities
const recentActivitiesData = [
  {
    id: 1,
    action: "New order #10234",
    details: "Cameron Williamson purchased Premium Yoga Mat",
    time: "Just now",
  },
  {
    id: 2,
    action: "Inventory alert",
    details: "Eco-Friendly Water Bottle (Blue) is low in stock (3 remaining)",
    time: "2 hours ago",
  },
  {
    id: 3,
    action: "New customer",
    details: "Leslie Alexander created an account",
    time: "5 hours ago",
  },
  {
    id: 4,
    action: "Product review",
    details: "Jane Cooper left a 5-star review on Wireless Earbuds",
    time: "Yesterday",
  },
  {
    id: 5,
    action: "Campaign completed",
    details: "Summer Sale email campaign has ended with 24% open rate",
    time: "2 days ago",
  },
];

const Dashboard: React.FC = () => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // TODO: Replace with real API calls using the useStoreData hook
  const { data: stats, isLoading: statsLoading } = useStoreData(statsData);
  const { data: sales, isLoading: salesLoading } = useStoreData(salesData);
  const { data: topProducts, isLoading: productsLoading } = useStoreData(topProductsData);
  const { data: customerAcquisition, isLoading: acquisitionLoading } = useStoreData(customerAcquisitionData);
  const { data: recentActivities, isLoading: activitiesLoading } = useStoreData(recentActivitiesData);

  // TODO: Replace with actual API data loading and error handling
  React.useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsFirstLoad(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Full page loading state
  if (isFirstLoad) {
    return (
      <AppLayout>
        <div className="container mx-auto space-y-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </AppLayout>
    );
  }

  // Empty state when no data available
  const hasNoData = !stats?.length && !sales?.length && !topProducts?.length && 
                    !customerAcquisition?.length && !recentActivities?.length;
  
  if (!isFirstLoad && hasNoData) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <EmptyState
            title="No dashboard data available"
            description="Connect your store or add some data to get started with analytics"
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
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to ShopAI Insight dashboard</p>
        </div>

        {/* Stats Grid */}
        {statsLoading ? (
          <LoadingState message="Loading dashboard statistics..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                    <span className={`text-xs font-medium flex items-center gap-1 ${
                      stat.trend === "up" ? "text-emerald-500" : "text-red-500"
                    }`}>
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {stat.change}
                    </span>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-muted-foreground text-sm font-medium">{stat.title}</h3>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <ChartWrapper
            title="Sales Overview"
            description="Sales vs target for the last 6 months"
            isLoading={salesLoading}
            isEmpty={!salesLoading && (!sales || sales.length === 0)}
            className="md:col-span-2"
          >
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Amount"]} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke={CHART_COLORS[0]} strokeWidth={2} />
                  <Line type="monotone" dataKey="target" stroke={CHART_COLORS[1]} strokeWidth={2} strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartWrapper>

          {/* Top Products */}
          <ChartWrapper
            title="Top Products"
            description="Most sold products by percentage"
            isLoading={productsLoading}
            isEmpty={!productsLoading && (!topProducts || topProducts.length === 0)}
          >
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProducts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartWrapper>

          {/* Customer Acquisition */}
          <ChartWrapper
            title="Customer Acquisition"
            description="How customers find your store"
            isLoading={acquisitionLoading}
            isEmpty={!acquisitionLoading && (!customerAcquisition || customerAcquisition.length === 0)}
          >
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={customerAcquisition}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                  <Bar dataKey="value" fill={CHART_COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartWrapper>

          {/* Recent Activity */}
          <ChartWrapper
            title="Recent Activity"
            description="Latest updates from your store"
            isLoading={activitiesLoading}
            isEmpty={!activitiesLoading && (!recentActivities || recentActivities.length === 0)}
            className="md:col-span-2"
          >
            <div className="space-y-6">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="mr-4 mt-1">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartWrapper>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
