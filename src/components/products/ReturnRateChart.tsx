import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { ReturnRateItem } from "@/hooks/useProductsData";

interface ReturnRateChartProps {
  data: ReturnRateItem[];
}

export const ReturnRateChart: React.FC<ReturnRateChartProps> = ({ data }) => {
  // Sort by return rate descending and take top 10
  const sortedData = [...data]
    .sort((a, b) => b.return_rate - a.return_rate)
    .slice(0, 10);
    
  // Truncate long product names for display
  const chartData = sortedData.map(item => ({
    name: item.product_title.length > 20 ? 
      `${item.product_title.substring(0, 20)}...` : 
      item.product_title,
    rate: item.return_rate,
    product_id: item.product_id,
    full_name: item.product_title,
    orders: item.orders_count,
    returns: item.returns_count
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Return Rate by Product</CardTitle>
        <CardDescription>Products with highest return percentages</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value, name, props) => [`${value}%`, "Return Rate"]}
                  labelFormatter={(label, props) => {
                    // Show the full product name in tooltip
                    const item = props[0]?.payload;
                    return item?.full_name || label;
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background p-2 border rounded shadow-sm">
                          <p className="font-medium text-xs">{data.full_name}</p>
                          <p className="text-xs text-muted-foreground">Orders: {data.orders}</p>
                          <p className="text-xs text-muted-foreground">Returns: {data.returns}</p>
                          <p className="text-xs font-bold">Return Rate: {data.rate}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="rate">
                  {chartData.map((entry, index) => (
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
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">
              No return data available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
