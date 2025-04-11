
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DiscountedOrder {
  id: string;
  total: number;
  discount: number;
  customer: string;
}

interface DiscountedOrdersListProps {
  data: DiscountedOrder[];
}

export const DiscountedOrdersList: React.FC<DiscountedOrdersListProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Discounted Orders</CardTitle>
        <CardDescription>Orders with highest discount percentages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[300px] overflow-auto">
          {data.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
              <div>
                <div className="font-medium">{order.id}</div>
                <div className="text-sm text-muted-foreground">{order.customer}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-medium">${order.total.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <Badge className="bg-amber-500">{order.discount}% off</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
