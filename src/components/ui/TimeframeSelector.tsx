// File: src/components/ui/TimeframeSelector.tsx

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimeframeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  value,
  onChange,
  disabled
}) => {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Timeframe" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="last7">Last 7 days</SelectItem>
        <SelectItem value="last30">Last 30 days</SelectItem>
        <SelectItem value="last90">Last 90 days</SelectItem>
        <SelectItem value="year">Last 12 months</SelectItem>
      </SelectContent>
    </Select>
  );
};
