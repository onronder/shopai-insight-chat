
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader, Check, Store } from "lucide-react";

// Sync status type definition
export type SyncStatusType = {
  orders: "pending" | "syncing" | "completed";
  products: "pending" | "syncing" | "completed";
  customers: "pending" | "syncing" | "completed";
};

interface SyncProgressProps {
  syncStatus: SyncStatusType;
  syncProgress: number;
  syncComplete: boolean;
}

export const SyncProgress: React.FC<SyncProgressProps> = ({
  syncStatus,
  syncProgress,
  syncComplete,
}) => {
  const renderSyncStatus = (status: "pending" | "syncing" | "completed") => {
    switch (status) {
      case "completed":
        return <Check className="h-5 w-5 text-green-500" />;
      case "syncing":
        return <Loader className="h-5 w-5 text-primary animate-spin" />;
      case "pending":
        return <div className="h-5 w-5 rounded-full border border-muted" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Syncing Your Store Data
        </CardTitle>
        <CardDescription>
          We're syncing your orders, products, and customers from Shopify.
          This may take 1–2 minutes depending on your store size.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Sync Progress</span>
            <span className="text-sm font-medium">{syncProgress}%</span>
          </div>
          <Progress value={syncProgress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            {renderSyncStatus(syncStatus.orders)}
            <span className={syncStatus.orders === "completed" ? "text-foreground" : "text-muted-foreground"}>
              Syncing Orders
            </span>
            {syncStatus.orders === "completed" && (
              <Badge variant="success" className="ml-auto">Completed</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {renderSyncStatus(syncStatus.products)}
            <span className={syncStatus.products === "completed" ? "text-foreground" : "text-muted-foreground"}>
              Syncing Products
            </span>
            {syncStatus.products === "completed" && (
              <Badge variant="success" className="ml-auto">Completed</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {renderSyncStatus(syncStatus.customers)}
            <span className={syncStatus.customers === "completed" ? "text-foreground" : "text-muted-foreground"}>
              Syncing Customers
            </span>
            {syncStatus.customers === "completed" && (
              <Badge variant="success" className="ml-auto">Completed</Badge>
            )}
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground italic">
          {syncComplete 
            ? "All data has been synced. You're ready to explore!" 
            : "Please wait while we prepare your dashboard..."}
        </div>
      </CardContent>
    </Card>
  );
};
