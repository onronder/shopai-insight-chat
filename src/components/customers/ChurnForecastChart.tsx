import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { ChurnCandidate } from "@/hooks/useCustomersData";
import { AlertTriangle, Clock } from "lucide-react";

export interface ChurnForecastChartProps {
  data: ChurnCandidate[];
}

export const ChurnForecastChart: React.FC<ChurnForecastChartProps> = ({ data }) => {
  // Sort by days inactive (most inactive first)
  const sortedData = [...data].sort((a, b) => b.days_inactive - a.days_inactive);
  
  // Calculate churn risk level 
  const getRiskLevel = (days: number) => {
    if (days >= 90) return "High";
    if (days >= 60) return "Medium";
    return "Low";
  };
  
  // Get the icon color based on risk level
  const getRiskColor = (days: number) => {
    if (days >= 90) return "text-red-500";
    if (days >= 60) return "text-amber-500";
    return "text-green-500";
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Churn Risk</CardTitle>
          <CardDescription>Customers at risk of churning</CardDescription>
        </div>
        <AlertTriangle className="h-5 w-5 text-amber-500" />
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="max-h-[300px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Days Inactive</TableHead>
                  <TableHead>Risk Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{customer.days_inactive} days</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${getRiskColor(customer.days_inactive)}`}>
                        {getRiskLevel(customer.days_inactive)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <Clock className="h-8 w-8 mb-2" />
            <p>No customers at risk of churning</p>
          </div>
        )}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
          <p><span className="font-medium">AI Insight:</span> Consider sending personalized emails to high-risk customers with special offers to encourage them to return.</p>
        </div>
      </CardContent>
    </Card>
  );
};
