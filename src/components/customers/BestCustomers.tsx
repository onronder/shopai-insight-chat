// File: src/components/customers/BestCustomers.tsx

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RepeatCustomer } from "@/hooks/useCustomersData";
import { UsersRound, Award } from "lucide-react";

export interface BestCustomersProps {
  data: RepeatCustomer[];
}

export const BestCustomers: React.FC<BestCustomersProps> = ({ data }) => {
  const repeatData = data.find(item => item.type === "repeat") || {
    count: 0,
    percentage: 0,
    type: "repeat",
  };
  const newData = data.find(item => item.type === "new") || {
    count: 0,
    percentage: 0,
    type: "new",
  };

  // ✅ Do not render anything if both counts are 0
  if (repeatData.count === 0 && newData.count === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Loyalty</CardTitle>
        <CardDescription>Repeat vs. new customer breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Repeat Customers
            </span>
            <span className="text-sm font-medium">
              {repeatData.count.toLocaleString()} ({repeatData.percentage}%)
            </span>
          </div>
          <Progress value={repeatData.percentage} className="h-2" />

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium flex items-center gap-2">
              <UsersRound className="h-4 w-4 text-blue-500" />
              New Customers
            </span>
            <span className="text-sm font-medium">
              {newData.count.toLocaleString()} ({newData.percentage}%)
            </span>
          </div>
          <Progress value={newData.percentage} className="h-2" />

          <div className="p-3 bg-muted/50 rounded-lg mt-4">
            <p className="text-sm">
              <span className="font-medium">AI Insight:</span>{" "}
              {repeatData.percentage > 50
                ? "You have a healthy repeat customer rate. Focus on maintaining customer satisfaction."
                : "Work on improving customer retention to increase your repeat customer rate."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
