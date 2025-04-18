import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { SegmentData } from "@/hooks/useCustomersData";

export interface CustomerSegmentsTableProps {
  data: SegmentData[];
}

export const CustomerSegmentsTable: React.FC<CustomerSegmentsTableProps> = ({ data }) => {
  // Sort data by customer count (descending)
  const sortedData = [...data].sort((a, b) => b.customer_count - a.customer_count);
  
  // Calculate total customers for percentage
  const totalCustomers = sortedData.reduce((sum, segment) => sum + segment.customer_count, 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Segments</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Segment</TableHead>
              <TableHead>Customers</TableHead>
              <TableHead>%</TableHead>
              <TableHead>Avg. Order Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((segment) => (
              <TableRow key={segment.segment} className="hover:bg-muted/50">
                <TableCell className="font-medium">{segment.segment}</TableCell>
                <TableCell>{segment.customer_count.toLocaleString()}</TableCell>
                <TableCell>
                  {totalCustomers > 0 
                    ? `${((segment.customer_count / totalCustomers) * 100).toFixed(1)}%` 
                    : '0%'}
                </TableCell>
                <TableCell>{formatCurrency(segment.avg_order_value)}</TableCell>
              </TableRow>
            ))}
            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  No customer segments available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
