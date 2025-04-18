import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useCustomersData, CustomerSegment } from "@/hooks/useCustomersData";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { TimeframeSelector } from "@/components/shared/TimeframeSelector";

export const CustomerSegmentsTable = () => {
  const { 
    segmentsData, 
    isLoading, 
    errorMessage, 
    timeframe, 
    setTimeframe,
    refetch
  } = useCustomersData()

  // Define colors for different segments
  const getSegmentColor = (segment: string): string => {
    const colors: Record<string, string> = {
      "High-Value": "bg-green-100 text-green-800 hover:bg-green-200",
      "Mid-Value": "bg-blue-100 text-blue-800 hover:bg-blue-200",
      "Low-Value": "bg-orange-100 text-orange-800 hover:bg-orange-200",
      "At-Risk": "bg-red-100 text-red-800 hover:bg-red-200",
      "Inactive": "bg-gray-100 text-gray-800 hover:bg-gray-200",
    }
    return colors[segment] || "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )
    }

    if (errorMessage) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )
    }

    if (!segmentsData || segmentsData.length === 0) {
      return (
        <EmptyState 
          title="No customer segments data available" 
          description="Try changing the timeframe or check back later."
          action={{
            label: "Refresh data",
            onClick: () => refetch()
          }}
        />
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Segment</TableHead>
            <TableHead className="text-right">Customers</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
            <TableHead className="text-right">Avg. Order Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {segmentsData.map((segment: CustomerSegment) => (
            <TableRow key={segment.segment}>
              <TableCell>
                <Badge className={getSegmentColor(segment.segment)}>
                  {segment.segment}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{segment.count.toLocaleString()}</TableCell>
              <TableCell className="text-right">{segment.percentage}%</TableCell>
              <TableCell className="text-right">${segment.avg_order_value.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Customer Segments</CardTitle>
          <CardDescription>Distribution of customers by their purchasing behavior</CardDescription>
        </div>
        <TimeframeSelector 
          value={timeframe} 
          onChange={setTimeframe}
          disabled={isLoading} 
        />
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  )
}
