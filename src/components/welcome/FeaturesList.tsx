
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export const FeaturesList: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>What You Can Do With ShopAI</CardTitle>
        <CardDescription>
          ShopAI Insight helps you gain meaningful insights from your Shopify store data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Understand sales trends</p>
              <p className="text-sm text-muted-foreground">
                Get clear visualizations of your sales performance over time
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Segment your customers</p>
              <p className="text-sm text-muted-foreground">
                Identify your VIPs, at-risk customers, and growth opportunities
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Chat with your store data</p>
              <p className="text-sm text-muted-foreground">
                Ask questions in plain English and get instant insights
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Visualize performance with clean dashboards</p>
              <p className="text-sm text-muted-foreground">
                At-a-glance metrics and KPIs to track your business growth
              </p>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};
