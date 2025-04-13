
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

interface CustomerChartProps {
  data?: Array<{name: string, value: number}>;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

// Default colors for the chart
const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
];

/**
 * Customer segments pie chart component
 */
export const CustomerChart: React.FC<CustomerChartProps> = ({ 
  data,
  isLoading = false,
  isError = false,
  onRetry
}) => {
  // TODO: Replace with data from API or Supabase backend
  const defaultData = [
    { name: "New Customers", value: 35 },
    { name: "Returning", value: 45 },
    { name: "Loyal", value: 20 },
  ];

  // Use provided data or fallback to default
  const chartData = data || defaultData;
  
  // Check if data is empty
  const isEmpty = !chartData || chartData.length === 0;

  return (
    <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="p-6 pb-2">
        <CardTitle>Customer Segments</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {isLoading ? (
          <LoadingState message="Loading customer segments..." />
        ) : isError ? (
          <ErrorState 
            title="Failed to load segments"
            description="There was an error loading customer segment data."
            retryLabel="Try again"
            onRetry={onRetry}
          />
        ) : isEmpty ? (
          <EmptyState 
            title="No Segment Data" 
            description="No customer segment data is available." 
          />
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
