
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, ShoppingCart, DollarSign, Clock } from "lucide-react";

// Mock data for stats
const stats = [
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

// Mock data for sales over time
const salesData = [
  { name: "Jan", sales: 4000, target: 4400 },
  { name: "Feb", sales: 3000, target: 3800 },
  { name: "Mar", sales: 5000, target: 4600 },
  { name: "Apr", sales: 8000, target: 5000 },
  { name: "May", sales: 6000, target: 5500 },
  { name: "Jun", sales: 9500, target: 6000 },
];

// Mock data for top products
const topProductsData = [
  { name: "Organic Cotton T-Shirt", value: 21 },
  { name: "Premium Yoga Mat", value: 18 },
  { name: "Eco-Friendly Water Bottle", value: 16 },
  { name: "Wireless Earbuds", value: 12 },
  { name: "Minimalist Watch", value: 8 },
  { name: "Others", value: 25 },
];

// Mock data for customer acquisition
const customerAcquisitionData = [
  { name: "Social Media", value: 30 },
  { name: "Direct", value: 25 },
  { name: "Organic Search", value: 20 },
  { name: "Referral", value: 15 },
  { name: "Email", value: 10 },
];

// Mock data for recent activities
const recentActivities = [
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#AAAAAA"];

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to ShopAI Insight dashboard</p>
      </div>

      {/* Stats Grid */}
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

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Sales vs target for the last 6 months</CardDescription>
            <Tabs defaultValue="monthly">
              <TabsList>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
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
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="target" stroke="#82ca9d" strokeWidth={2} strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Most sold products by percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProductsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {topProductsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Acquisition */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Acquisition</CardTitle>
            <CardDescription>How customers find your store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={customerAcquisitionData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your store</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
