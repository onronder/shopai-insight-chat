
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from "recharts";

interface OrderStatusItem {
  name: string;
  value: number;
}

interface OrderStatusChartProps {
  data: OrderStatusItem[];
  colors: string[];
}

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data, colors }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status Breakdown</CardTitle>
        <CardDescription>Distribution of order statuses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {data.map((status, index) => (
            <div key={index} className="flex flex-col items-center p-2 rounded-md border">
              <div 
                className="w-3 h-3 rounded-full mb-1" 
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-xs font-medium">{status.name}</span>
              <span className="text-xs text-muted-foreground">{status.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
