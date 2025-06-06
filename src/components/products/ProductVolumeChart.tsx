import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

interface ProductVolumeChartProps {
  data: Array<{ name: string; units: number; revenue: number }>;
}

export const ProductVolumeChart: React.FC<ProductVolumeChartProps> = ({ data }) => {
  const [activeMetric, setActiveMetric] = useState<"units" | "revenue">("units");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>
          Best performing products by units sold and revenue
        </CardDescription>
        <Tabs defaultValue="units" onValueChange={(v) => setActiveMetric(v as "units" | "revenue")}>
          <TabsList>
            <TabsTrigger value="units">By Units</TabsTrigger>
            <TabsTrigger value="revenue">By Revenue</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 20, right: 30, left: 140, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 12 }}
                width={140}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "units") return [`${value} units`, "Units Sold"];
                  if (name === "revenue") return [`$${value.toLocaleString()}`, "Revenue"];
                  return [value, name];
                }}
              />
              <Bar
                dataKey={activeMetric}
                fill={activeMetric === "units" ? "#3B82F6" : "#10B981"}
                name={activeMetric === "units" ? "Units Sold" : "Revenue"}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
