
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

// Sample data
const data = [
  { name: "Premium Headphones", sales: 47 },
  { name: "Bluetooth Speaker", sales: 38 },
  { name: "Wireless Earbuds", sales: 35 },
  { name: "Smart Watch", sales: 32 },
  { name: "Phone Case", sales: 27 },
];

export const ProductsChart: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};
