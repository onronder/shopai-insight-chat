// src/components/customers/LTVDistribution.tsx
import React from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useLtvDistributionData } from "@/hooks/useLtvDistributionData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

const COLOR_MAP = {
  "Bottom 20%": "#e5e7eb",
  "Low-Mid": "#a5b4fc",
  "Mid": "#818cf8",
  "Upper-Mid": "#6366f1",
  "Top 20%": "#4338ca",
};

export const LTVDistribution: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useLtvDistributionData();

  if (isLoading) {
    return <LoadingState message="Loading lifetime value distribution..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load LTV data"
        description={error?.message || "Unknown error occurred"}
        retryLabel="Retry"
        onRetry={refetch}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No data found"
        description="Customer LTV data is not yet available."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Lifetime Value</CardTitle>
        <CardDescription>Percentile-based breakdown by total spend</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString()} customers`, "Segment"]}
              />
              <Bar dataKey="customer_count">
                {data.map((entry, i) => (
                  <cell
                    key={`cell-${i}`}
                    fill={COLOR_MAP[entry.label as keyof typeof COLOR_MAP] || "#6366f1"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
