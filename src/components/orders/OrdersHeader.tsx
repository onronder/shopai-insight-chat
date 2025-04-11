
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrdersHeaderProps {
  timeframe: string;
  onTimeframeChange: (value: string) => void;
}

export const OrdersHeader: React.FC<OrdersHeaderProps> = ({ 
  timeframe, 
  onTimeframeChange 
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders & Fulfillment</h2>
        <p className="text-muted-foreground">Track your order performance and fulfillment metrics</p>
      </div>
      <Select value={timeframe} onValueChange={onTimeframeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a timeframe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="last7">Last 7 days</SelectItem>
          <SelectItem value="last14">Last 14 days</SelectItem>
          <SelectItem value="last30">Last 30 days</SelectItem>
          <SelectItem value="last90">Last 90 days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
