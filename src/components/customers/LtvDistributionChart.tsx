import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { LtvPercentileBucket } from "@/hooks/useLtvDistributionData";

export interface LtvDistributionChartProps {
  data: LtvPercentileBucket[];
}

export const LtvDistributionChart: React.FC<LtvDistributionChartProps> = ({ data }) => {
  // Predefine ordered labels
  const bucketOrder = ["0–20%", "21–40%", "41–60%", "61–80%", "81–100%"];

  // Assign color shades (light to dark)
  const COLORS = [
    "#dbeafe", // lightest blue
    "#93c5fd",
    "#60a5fa",
    "#3b82f6",
    "#1d4ed8", // darkest blue
  ];

  // Sort and pair each bucket with color
  const sortedData = bucketOrder.map((label, i) => {
    const match = data.find((d) => d.bucket === label);
    return {
      bucket: label,
      count: match?.count || 0,
      fill: COLORS[i],
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>LTV Percentile Distribution</CardTitle>
        <CardDescription>Customer lifetime value grouped by percentile</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString()} customers`, "Segment"]}
              />
              <Bar dataKey="count" name="Customers">
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
