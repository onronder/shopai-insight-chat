
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const SubscriptionSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription & Billing</CardTitle>
        <CardDescription>
          Manage your subscription plan and billing details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Current Plan</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="default" className="bg-primary">Pro</Badge>
              <span className="text-sm text-muted-foreground">$29/month</span>
            </div>
          </div>
          <Button variant="outline">
            {/* TODO: Connect to billing management API or service */}
            Manage Subscription
          </Button>
        </div>
        <Separator />
        <p className="text-sm text-muted-foreground">
          Invoices are handled via Lemon Squeezy. For billing inquiries, please contact support.
        </p>
      </CardContent>
    </Card>
  );
};

export default SubscriptionSettings;
