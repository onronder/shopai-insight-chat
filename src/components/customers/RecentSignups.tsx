import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCustomersData } from "@/hooks/useCustomersData";

export const RecentSignups: React.FC = () => {
  const { recentSignups, isLoading } = useCustomersData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Signups</CardTitle>
          <CardDescription>New customers who recently joined your store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recentSignups || recentSignups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Signups</CardTitle>
          <CardDescription>New customers who recently joined your store</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No recent signups"
            description="You don't have any new customers yet."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Signups</CardTitle>
        <CardDescription>New customers who recently joined your store</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentSignups.map((customer) => {
            const initials = `${customer.first_name?.[0] || ""}${customer.last_name?.[0] || ""}` || "👤";
            const fullName = `${customer.first_name ?? "Unnamed"} ${customer.last_name ?? ""}`.trim();
            const dateJoined = customer.created_at
              ? new Date(customer.created_at).toLocaleDateString()
              : "N/A";

            return (
              <div
                key={customer.id}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fullName}</p>
                  <p className="text-xs text-muted-foreground">Joined {dateJoined}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {customer.first_order_value !== null &&
                    customer.first_order_value !== undefined
                      ? `$${customer.first_order_value.toFixed(2)}`
                      : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">First order</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
