
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

interface ProductsChartProps {
  data?: Array<{name: string, sales: number}>;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

// Sample data
const defaultData = [
  { name: "Premium Headphones", sales: 47 },
  { name: "Bluetooth Speaker", sales: 38 },
  { name: "Wireless Earbuds", sales: 35 },
  { name: "Smart Watch", sales: 32 },
  { name: "Phone Case", sales: 27 },
];

export const ProductsChart: React.FC<ProductsChartProps> = ({
  data,
  isLoading = false,
  isError = false,
  onRetry
}) => {
  // Use provided data or fallback to default
  const chartData = data || defaultData;
  
  // Check if data is empty
  const isEmpty = !chartData || chartData.length === 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            title="Failed to load product data"
            description="There was an error loading the top selling products."
            retryLabel="Try again"
            onRetry={onRetry}
          />
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No product data"
            description="No product sales data is available yet."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                scale="band" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                width={80}
              />
              <Tooltip formatter={(value) => [`${value} units`, "Sales"]} />
              <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.7)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
