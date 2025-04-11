
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface AverageOrderValueChartProps {
  data: Array<{ date: string; value: number }>;
}

export const AverageOrderValueChart: React.FC<AverageOrderValueChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Order Value</CardTitle>
        <CardDescription>Daily AOV trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[60, 90]} tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => {
                if (typeof value === 'number') {
                  return [`$${value.toFixed(2)}`, "AOV"];
                }
                return [`$${value}`, "AOV"];
              }} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
