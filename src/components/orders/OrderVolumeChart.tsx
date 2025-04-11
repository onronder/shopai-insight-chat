
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface OrderVolumeChartProps {
  data: Array<{ date: string; orders: number; isSale?: boolean }>;
}

export const OrderVolumeChart: React.FC<OrderVolumeChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Volume</CardTitle>
        <CardDescription>Daily orders with sale period highlights</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
              {data.map((entry, index) => (
                entry.isSale && (
                  <Area
                    key={`sale-${index}`}
                    type="monotone"
                    dataKey="orders"
                    data={[data[index]]}
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.5}
                    strokeWidth={2}
                  />
                )
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-2 justify-center mt-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#8884d8]"></div>
            <span className="text-xs">Regular days</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
            <span className="text-xs">Sale days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
