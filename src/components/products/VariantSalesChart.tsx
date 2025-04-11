
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface VariantSalesChartProps {
  data: Array<Record<string, any>>;
}

export const VariantSalesChart: React.FC<VariantSalesChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Variant Sales Breakdown</CardTitle>
        <CardDescription>Sales distribution across product variants</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(data[0])
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
  );
};
