import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { LtvBucket } from "@/hooks/useCustomersData";

export interface LtvDistributionChartProps {
  data: LtvBucket[];
}

export const LtvDistributionChart: React.FC<LtvDistributionChartProps> = ({ data }) => {
  // Sort data by bucket amount
  const bucketOrder = {
    '$0': 0,
    '$1-99': 1,
    '$100-249': 2,
    '$250-499': 3,
    '$500-999': 4,
    '$1000+': 5
  };
  
  const sortedData = [...data].sort((a, b) => {
    return (bucketOrder[a.bucket as keyof typeof bucketOrder] || 0) - 
           (bucketOrder[b.bucket as keyof typeof bucketOrder] || 0);
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>LTV Distribution</CardTitle>
        <CardDescription>Lifetime value spread across customer base</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} customers`, 'Count']} />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
