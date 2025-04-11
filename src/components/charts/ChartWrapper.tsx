
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  headerAction?: React.ReactNode;
  className?: string;
  skeletonHeight?: number;
}

/**
 * Reusable wrapper for chart components with loading and empty states
 */
export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  description,
  children,
  isLoading = false,
  isEmpty = false,
  emptyMessage = "No data available for this chart",
  headerAction,
  className,
  skeletonHeight = 300,
}) => {
  return (
    <Card className={className}>
      <CardHeader className={`${headerAction ? 'flex-row items-center justify-between space-y-0' : ''}`}>
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {headerAction && (
          <div>{headerAction}</div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full space-y-2">
            <Skeleton className={`w-full h-[${skeletonHeight}px]`} />
          </div>
        ) : isEmpty ? (
          <EmptyState 
            title="No Data" 
            description={emptyMessage} 
          />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};
