
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

interface ReturnRateChartProps {
  data: Array<{ name: string; rate: number }>;
}

export const ReturnRateChart: React.FC<ReturnRateChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Return Rate by Product</CardTitle>
        <CardDescription>Products with highest return percentages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => [`${value}%`, "Return Rate"]} />
              <Bar dataKey="rate">
                {data.map((entry, index) => (
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
  );
};
