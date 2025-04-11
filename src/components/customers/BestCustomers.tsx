
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Customer } from "@/types/customer-types";

interface BestCustomersProps {
  customers: Customer[];
}

export const BestCustomers: React.FC<BestCustomersProps> = ({ customers }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Best Customers</CardTitle>
          <CardDescription>Top 5 customers by lifetime value</CardDescription>
        </div>
        <Button size="sm" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers.map((customer, index) => (
            <div key={customer.id} className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center font-medium mr-4">
                #{index + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{customer.name}</div>
                <div className="text-xs text-muted-foreground">{customer.email}</div>
              </div>
              <div className="text-lg font-bold">${customer.ltv.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
