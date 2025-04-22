import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useSalesOverviewData } from "@/hooks/useSalesOverviewData";

const SalesChart: React.FC = () => {
  const { data, isLoading, isError, refetch } = useSalesOverviewData();

  const formattedData =
    data?.map((point) => ({
      name: new Date(point.day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      sales: point.net,
    })) || [];

  const isEmpty = formattedData.length === 0;

  return (
    <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="p-6">
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex justify-center items-center min-h-[300px]">
        {isLoading ? (
          <LoadingState message="Loading sales data..." />
        ) : isError ? (
          <ErrorState
            title="Could not load sales data"
            description="There was an error loading the sales metrics."
            retryLabel="Try again"
            onRetry={refetch}
          />
        ) : isEmpty ? (
          <EmptyState
            title="No sales data available"
            description="We'll show insights once sales data becomes available."
          />
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Net Revenue"]}
                />
                <Bar
                  dataKey="sales"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesChart;
