import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader, Check, Store } from "lucide-react";

export type SyncStatusValue = "pending" | "syncing" | "completed";
export type SyncStatusType = {
  orders: SyncStatusValue;
  products: SyncStatusValue;
  customers: SyncStatusValue;
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
  const renderIcon = (status: SyncStatusValue) => {
    if (status === "completed")
      return <Check className="h-5 w-5 text-green-500" />;
    if (status === "syncing")
      return <Loader className="h-5 w-5 text-primary animate-spin" />;
    return <div className="h-5 w-5 rounded-full border border-muted" />;
  };

  const renderRow = (label: string, status: SyncStatusValue) => (
    <div className="flex items-center gap-3">
      {renderIcon(status)}
      <span
        className={
          status === "completed" ? "text-foreground" : "text-muted-foreground"
        }
      >
        {label}
      </span>
      {status === "completed" && (
        <Badge variant="success" className="ml-auto">
          Completed
        </Badge>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Syncing Your Store Data
        </CardTitle>
        <CardDescription>
          This may take a moment depending on your store size.
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
          {renderRow("Syncing Orders", syncStatus.orders)}
          {renderRow("Syncing Products", syncStatus.products)}
          {renderRow("Syncing Customers", syncStatus.customers)}
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
