
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useQuery } from '@tanstack/react-query';

// Mock data - to be replaced with Supabase data
const mockSalesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
];

const SalesChart: React.FC = () => {
  // Mock query - would connect to Supabase in production
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['salesData'],
    queryFn: async () => {
      // Simulate API call
      return new Promise<typeof mockSalesData>((resolve, reject) => {
        setTimeout(() => {
          resolve(mockSalesData);
        }, 1000);
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="p-6">
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <LoadingState message="Loading sales data..." />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="p-6">
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex justify-center items-center min-h-[300px]">
          <ErrorState 
            title="Could not load sales data"
            description="There was an error loading the sales metrics."
            retryLabel="Try again"
            onRetry={() => refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="p-6">
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex justify-center items-center min-h-[300px]">
          <EmptyState 
            title="No sales data available"
            description="We'll show insights once sales data becomes available."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="p-6">
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;
