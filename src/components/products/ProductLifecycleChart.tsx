import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts";
import { ProductLifecycleItem } from "@/hooks/useProductsData";

interface ProductLifecycleChartProps {
  data: ProductLifecycleItem[];
}

export const ProductLifecycleChart: React.FC<ProductLifecycleChartProps> = ({ data }) => {
  // Define colors for each lifecycle stage
  const COLORS = {
    'New': '#3B82F6',      // Blue
    'Growing': '#10B981',  // Green
    'Mature': '#8B5CF6',   // Purple
    'Declining': '#F59E0B', // Amber
    'Flat': '#94A3B8'      // Slate
  };
  
  // Add colors to each data point
  const chartData = data.map(item => ({
    ...item,
    color: COLORS[item.lifecycle_stage as keyof typeof COLORS] || '#94A3B8',
    // For display purposes, format the percentage
    formattedShare: `${item.revenue_share.toFixed(1)}%`
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Lifecycle Distribution</CardTitle>
        <CardDescription>Products categorized by lifecycle stage with revenue share</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="revenue_share"
                  nameKey="lifecycle_stage"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({name, percent}) => `${(percent * 100).toFixed(1)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Revenue Share"]}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background p-2 border rounded shadow-sm">
                          <p className="font-medium">{data.lifecycle_stage}</p>
                          <p className="text-xs text-muted-foreground">Products: {data.product_count}</p>
                          <p className="text-xs font-bold">Revenue: {data.formattedShare}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">
              No product lifecycle data available
            </p>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {Object.entries(COLORS).map(([stage, color]) => (
            <div key={stage} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-xs">{stage}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
