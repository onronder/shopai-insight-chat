import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RepeatRatio } from "@/hooks/useCustomersData";
import { UsersRound, Award } from "lucide-react";

export interface BestCustomersProps {
  data: RepeatRatio;
}

export const BestCustomers: React.FC<BestCustomersProps> = ({ data }) => {
  const { repeat_customers, new_customers } = data;
  const total = repeat_customers + new_customers;
  
  // Calculate percentages
  const repeatPercentage = total > 0 ? (repeat_customers / total) * 100 : 0;
  const newPercentage = total > 0 ? (new_customers / total) * 100 : 0;
  
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
            <span className="text-sm font-medium">{repeat_customers.toLocaleString()} ({repeatPercentage.toFixed(1)}%)</span>
          </div>
          <Progress value={repeatPercentage} className="h-2" />
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium flex items-center gap-2">
              <UsersRound className="h-4 w-4 text-blue-500" />
              New Customers
            </span>
            <span className="text-sm font-medium">{new_customers.toLocaleString()} ({newPercentage.toFixed(1)}%)</span>
          </div>
          <Progress value={newPercentage} className="h-2" />
          
          <div className="p-3 bg-muted/50 rounded-lg mt-4">
            <p className="text-sm">
              <span className="font-medium">AI Insight:</span> {repeatPercentage > 50 
                ? "You have a healthy repeat customer rate. Focus on maintaining customer satisfaction."
                : "Work on improving customer retention to increase your repeat customer rate."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
