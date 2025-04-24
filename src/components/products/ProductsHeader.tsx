import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { Timeframe } from "@/hooks/useProductsData";

interface ProductsHeaderProps {
  timeframe: Timeframe;
  onTimeframeChange: (value: Timeframe) => void;
}

export const ProductsHeader: React.FC<ProductsHeaderProps> = ({
  timeframe,
  onTimeframeChange
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Product Performance</h2>
        <p className="text-muted-foreground">
          Analyze your product sales, inventory, and lifecycle
        </p>
      </div>
      <Select value={timeframe} onValueChange={(val) => onTimeframeChange(val as Timeframe)}>
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
