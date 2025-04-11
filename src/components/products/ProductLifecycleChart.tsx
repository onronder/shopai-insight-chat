
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface ProductLifecycleChartProps {
  data: Array<{ month: string; new: number; trending: number; declining: number }>;
}

export const ProductLifecycleChart: React.FC<ProductLifecycleChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Lifecycle Timeline</CardTitle>
        <CardDescription>Tracking products through their lifecycle stages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="new" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="trending" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="declining" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
            <span className="text-xs">New Products</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
            <span className="text-xs">Trending Products</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
            <span className="text-xs">Declining Products</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
