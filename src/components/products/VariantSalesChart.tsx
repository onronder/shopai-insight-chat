import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps
} from "recharts";
import { VariantSale } from "@/hooks/useProductsData";
import { formatCurrency } from "@/lib/utils";
import { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

interface VariantSalesChartProps {
  data: VariantSale[];
}

export const VariantSalesChart: React.FC<VariantSalesChartProps> = ({ data }) => {
  const chartData = data
    .slice(0, 10)
    .map(item => ({
      name: item.title.length > 20 ? item.title.substring(0, 20) + "..." : item.title,
      revenue: item.revenue || 0,
      count: item.count || 0,
      id: item.variant_id
    }));

  const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({ active, payload, label }) => {
    if (active && payload && payload.length >= 2) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm">Revenue: {formatCurrency(Number(payload[0].value))}</p>
          <p className="text-sm">Orders: {Number(payload[1].value).toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variant Sales Breakdown</CardTitle>
        <CardDescription>Top selling product variants by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No sales data available</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 11 }}
                />
                <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `$${value}`} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="count" name="Orders" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
