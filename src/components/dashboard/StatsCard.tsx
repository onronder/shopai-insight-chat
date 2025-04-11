
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change?: {
    value: number;
    timeframe: string;
  };
  icon: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
}) => {
  const isPositive = change && change.value > 0;
  const isNegative = change && change.value < 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                "text-xs font-medium inline-flex items-center",
                isPositive && "text-green-600",
                isNegative && "text-red-600",
                !isPositive && !isNegative && "text-muted-foreground"
              )}
            >
              {isPositive && <ArrowUp className="h-3 w-3 mr-1" />}
              {isNegative && <ArrowDown className="h-3 w-3 mr-1" />}
              {isPositive ? "+" : ""}
              {change.value}% vs {change.timeframe}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
