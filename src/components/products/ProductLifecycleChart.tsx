import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } from "recharts";
import { ProductLifecycle } from "@/hooks/useProductsData";

interface ProductLifecycleChartProps {
  data: ProductLifecycle[];
}

export const ProductLifecycleChart: React.FC<ProductLifecycleChartProps> = ({ data }) => {
  // Define colors for each lifecycle stage
  const COLORS = {
    'new': '#3B82F6',      // Blue
    'growth': '#10B981',  // Green
    'mature': '#8B5CF6',   // Purple
    'decline': '#F59E0B', // Amber
  };
  
  // Group products by lifecycle stage and count
  const stageStats = data.reduce<Record<string, {count: number, products: ProductLifecycle[]}>>((acc, product) => {
    const stage = product.lifecycle_stage;
    if (!acc[stage]) {
      acc[stage] = { count: 0, products: [] };
    }
    acc[stage].count += 1;
    acc[stage].products.push(product);
    return acc;
  }, {});
  
  // Create data for pie chart
  const chartData = Object.entries(stageStats).map(([stage, stats]) => ({
    name: stage.charAt(0).toUpperCase() + stage.slice(1),
    value: stats.count,
    products: stats.products,
    color: COLORS[stage as keyof typeof COLORS] || '#94A3B8'
  }));

  // Calculate total for percentage
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Lifecycle Distribution</CardTitle>
        <CardDescription>Products categorized by lifecycle stage</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} products`, "Count"]}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percentage = ((data.value / total) * 100).toFixed(1);
                      return (
                        <div className="bg-background p-2 border rounded shadow-sm">
                          <p className="font-medium">{data.name} Stage</p>
                          <p className="text-xs text-muted-foreground">Products: {data.value}</p>
                          <p className="text-xs font-bold">Percentage: {percentage}%</p>
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
              <span className="text-xs">{stage.charAt(0).toUpperCase() + stage.slice(1)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
