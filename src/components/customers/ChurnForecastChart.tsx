
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { AlertTriangle } from "lucide-react";
import { ChurnDataPoint } from "@/types/customer-types";

interface ChurnForecastChartProps {
  actualData: ChurnDataPoint[];
  projectedData: ChurnDataPoint[];
  combinedData: ChurnDataPoint[];
}

export const ChurnForecastChart: React.FC<ChurnForecastChartProps> = ({ 
  actualData, 
  projectedData, 
  combinedData 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Churn Forecast</CardTitle>
          <CardDescription>Predicted customer churn for next 3 months</CardDescription>
        </div>
        <AlertTriangle className="h-5 w-5 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 5]} tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => [`${value}%`, "Churn Rate"]} />
              {/* Actual data line */}
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Actual"
                isAnimationActive={false}
                connectNulls={true}
                dot={false}
                activeDot={{ r: 6, fill: "#8884d8" }}
              />
              {/* Projected data line with dashed stroke */}
              <Line 
                type="monotone" 
                data={projectedData}
                dataKey="rate" 
                stroke="#8884d8" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Projected"
                isAnimationActive={false}
                connectNulls={true}
                dot={{ r: 4, fill: "#8884d8" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
          <p><span className="font-medium">AI Insight:</span> Customer churn is projected to increase by 1.1% over the next quarter. Consider implementing a retention campaign targeting at-risk customers, especially those who haven't purchased in 60+ days.</p>
        </div>
      </CardContent>
    </Card>
  );
};
