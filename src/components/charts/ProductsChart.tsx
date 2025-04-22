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
  data?: Array<{ name: string; sales: number }>;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export const ProductsChart: React.FC<ProductsChartProps> = ({
  data = [],
  isLoading = false,
  isError = false,
  onRetry
}) => {
  const isEmpty = data.length === 0;

  const renderChart = () => (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
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
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === 0 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.7)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="p-6 pb-2">
        <CardTitle>Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {isLoading ? (
          <Skeleton className="h-80 w-full rounded-xl" />
        ) : isError ? (
          <ErrorState
            title="Failed to load product data"
            description="There was an error loading the top selling products."
            retryLabel="Try again"
            onRetry={onRetry}
          />
        ) : isEmpty ? (
          <EmptyState
            title="No product data"
            description="No product sales data is available yet."
          />
        ) : (
          renderChart()
        )}
      </CardContent>
    </Card>
  );
};
