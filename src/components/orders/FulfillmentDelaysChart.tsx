
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { AlertTriangle } from "lucide-react";

interface FulfillmentDelay {
  day: string;
  value: number;
  delayed?: boolean;
}

interface FulfillmentDelaysChartProps {
  data: FulfillmentDelay[];
}

export const FulfillmentDelaysChart: React.FC<FulfillmentDelaysChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Fulfillment Delays</CardTitle>
          <CardDescription>Time from order to fulfillment</CardDescription>
        </div>
        <AlertTriangle className="h-5 w-5 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8">
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.delayed ? "#EF4444" : "#8884d8"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
          <p><span className="font-medium">Warning:</span> 4% of your orders take 4+ days to fulfill. Consider optimizing your fulfillment process to improve customer satisfaction and reduce support inquiries.</p>
        </div>
      </CardContent>
    </Card>
  );
};
