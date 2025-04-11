import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

// Mock data for top selling products
const topSellingProductsData = [
  { name: "Organic Cotton T-Shirt", units: 245, revenue: 12250 },
  { name: "Premium Yoga Mat", units: 187, revenue: 13090 },
  { name: "Eco-Friendly Water Bottle", units: 156, revenue: 5460 },
  { name: "Wireless Earbuds", units: 132, revenue: 15840 },
  { name: "Minimalist Watch", units: 98, revenue: 19600 },
  { name: "Sustainable Backpack", units: 87, revenue: 8700 },
  { name: "Fitness Tracker", units: 76, revenue: 11400 },
  { name: "Bamboo Toothbrush Set", units: 67, revenue: 1675 },
];

// Inventory at risk data
const inventoryAtRiskData = [
  { name: "Vintage Denim Jacket", stock: 5, daysSinceLastSale: 45, critical: true },
  { name: "Designer Sunglasses", stock: 3, daysSinceLastSale: 38, critical: true },
  { name: "Leather Wallet", stock: 12, daysSinceLastSale: 32, critical: false },
  { name: "Cashmere Scarf", stock: 7, daysSinceLastSale: 30, critical: false },
  { name: "Limited Edition Sneakers", stock: 2, daysSinceLastSale: 25, critical: true },
];

// Return rate by product data
const returnRateData = [
  { name: "Skinny Jeans", rate: 12.5 },
  { name: "Winter Boots", rate: 8.7 },
  { name: "Summer Dress", rate: 6.2 },
  { name: "Wireless Earbuds", rate: 5.8 },
  { name: "Smart Watch", rate: 4.3 },
  { name: "Running Shoes", rate: 3.1 },
  { name: "Organic Cotton T-Shirt", rate: 1.8 },
];

// Variant sales breakdown data
const variantSalesData = [
  { 
    name: "Organic Cotton T-Shirt", 
    "Small": 45, 
    "Medium": 120, 
    "Large": 65, 
    "X-Large": 15 
  },
  { 
    name: "Premium Yoga Mat", 
    "Blue": 45, 
    "Pink": 52, 
    "Black": 75, 
    "Green": 15 
  },
  { 
    name: "Eco-Friendly Water Bottle", 
    "500ml": 86, 
    "750ml": 55, 
    "1L": 15 
  },
];

// Product lifecycle data
const productLifecycleData = [
  { month: "Jan", new: 15, trending: 8, declining: 3 },
  { month: "Feb", new: 12, trending: 10, declining: 5 },
  { month: "Mar", new: 8, trending: 12, declining: 7 },
  { month: "Apr", new: 10, trending: 15, declining: 6 },
  { month: "May", new: 7, trending: 18, declining: 9 },
  { month: "Jun", new: 9, trending: 16, declining: 12 },
];

const ProductsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(true);
  
  React.useEffect(() => {
    setLoading(false);
  }, []);
  
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
  
  if (!hasData) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <EmptyState
            title="No product data available"
            description="Connect your store to import product data or add products manually"
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
            <h2 className="text-3xl font-bold tracking-tight">Product Performance</h2>
            <p className="text-muted-foreground">Analyze your product sales, inventory, and lifecycle</p>
          </div>
          <Select defaultValue="last30">
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
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performing products by units sold and revenue</CardDescription>
            <Tabs defaultValue="units">
              <TabsList>
                <TabsTrigger value="units">By Units</TabsTrigger>
                <TabsTrigger value="revenue">By Revenue</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topSellingProductsData}
                  margin={{ top: 20, right: 30, left: 140, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                    width={140}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "units") return [`${value} units`, "Units Sold"];
                      if (name === "revenue") return [`$${value.toLocaleString()}`, "Revenue"];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="units" fill="#8884d8" name="units" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Inventory at Risk</CardTitle>
                <CardDescription>Products with low stock or low sales</CardDescription>
              </div>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>No Sales In</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryAtRiskData.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className={product.stock <= 5 ? "text-red-500 font-medium" : ""}>
                        {product.stock} units
                      </TableCell>
                      <TableCell>{product.daysSinceLastSale} days</TableCell>
                      <TableCell>
                        {product.critical ? (
                          <Badge variant="destructive">Restock Now</Badge>
                        ) : (
                          <Badge variant="outline">Monitor</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Return Rate by Product</CardTitle>
              <CardDescription>Products with highest return percentages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={returnRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => [`${value}%`, "Return Rate"]} />
                    <Bar dataKey="rate">
                      {returnRateData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.rate > 10 ? "#EF4444" :
                            entry.rate > 5 ? "#F59E0B" : "#10B981"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variant Sales Breakdown</CardTitle>
              <CardDescription>Sales distribution across product variants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={variantSalesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(variantSalesData[0])
                      .filter((key) => key !== "name")
                      .map((key, index) => (
                        <Bar 
                          key={key} 
                          dataKey={key} 
                          stackId="a" 
                          fill={`hsl(${index * 40}, 70%, 50%)`} 
                        />
                      ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Lifecycle Timeline</CardTitle>
              <CardDescription>Tracking products through their lifecycle stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={productLifecycleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="new" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="trending" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="declining" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
                  <span className="text-xs">New Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                  <span className="text-xs">Trending Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                  <span className="text-xs">Declining Products</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProductsPage;
