
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Customer } from "@/types/customer-types";

interface RecentSignupsProps {
  recentSignups: Customer[];
}

export const RecentSignups: React.FC<RecentSignupsProps> = ({ recentSignups }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Signups</CardTitle>
        <CardDescription>New customers who recently joined your store</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentSignups.map((customer) => (
            <div key={customer.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {customer.name.substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{customer.name}</p>
                <p className="text-xs text-muted-foreground">Joined {customer.date ? new Date(customer.date).toLocaleDateString() : "N/A"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">${customer.firstOrderValue?.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">First order</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
