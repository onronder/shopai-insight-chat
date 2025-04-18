import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

// Define the data structure we expect from the API
interface LTVDistributionItem {
  bucket: string;
  count: number;
}

interface LTVDistributionProps {
  data: LTVDistributionItem[];
  isLoading: boolean;
  error: Error | null;
}

// Custom colors for the bars based on spending bucket
const COLORS: Record<string, string> = {
  '$0': '#d1d5db',
  '$1-99': '#a5b4fc',
  '$100-249': '#818cf8',
  '$250-499': '#6366f1',
  '$500-999': '#4f46e5',
  '$1000+': '#4338ca',
};

// The component itself
export const LTVDistribution: React.FC<LTVDistributionProps> = ({ 
  data, 
  isLoading,
  error
}) => {
  // Handle loading state
  if (isLoading) {
    return (
      <Card className="col-span-1 row-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Customer Lifetime Value</CardTitle>
          <CardDescription>Distribution of customers by LTV</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <Skeleton className="h-[250px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card className="col-span-1 row-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Customer Lifetime Value</CardTitle>
          <CardDescription>Distribution of customers by LTV</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <EmptyState
              title="Error loading data"
              description={`Failed to load LTV distribution: ${error.message}`}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle empty data state
  if (!data || data.length === 0) {
    return (
      <Card className="col-span-1 row-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Customer Lifetime Value</CardTitle>
          <CardDescription>Distribution of customers by LTV</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <EmptyState
              title="No LTV data available"
              description="There is no customer spending data to display."
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Define the expected order of buckets for consistent display
  const bucketOrder = ['$0', '$1-99', '$100-249', '$250-499', '$500-999', '$1000+'];
  
  // Sort the data according to bucket order
  const sortedData = [...data].sort((a, b) => {
    const indexA = bucketOrder.indexOf(a.bucket);
    const indexB = bucketOrder.indexOf(b.bucket);
    return indexA - indexB;
  });

  // Get color for each bucket
  const getBarColor = (entry: LTVDistributionItem) => {
    return COLORS[entry.bucket] || '#6366f1';
  };

  // Custom tooltip to show the bucket name and count
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-medium">{payload[0].payload.bucket}</p>
          <p>{`${payload[0].value.toLocaleString()} customers`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-1 row-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Customer Lifetime Value</CardTitle>
        <CardDescription>Distribution of customers by LTV</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="bucket" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                tickMargin={25}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="count" 
                name="Customers" 
                fill="#6366f1"
                stroke="#4f46e5"
                fillOpacity={0.8}
                isAnimationActive={true}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 