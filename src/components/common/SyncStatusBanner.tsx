import { useStoreSyncStatus } from "@/hooks/useStoreSyncStatus";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

export function SyncStatusBanner() {
  const { syncStatus, syncStartedAt, syncFinishedAt, isLoading, isError } = useStoreSyncStatus();

  // If data is loading, show nothing to avoid flashing
  if (isLoading) {
    return null;
  }

  // If there's an error, show an error alert
  if (isError) {
    return (
      <Alert className="mb-4 border-red-500 bg-red-50 dark:bg-red-950/30">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <AlertTitle className="text-red-500">Sync Status Error</AlertTitle>
        <AlertDescription>
          Unable to fetch sync status. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  // If the store is currently syncing
  if (syncStatus === "syncing") {
    const startTime = syncStartedAt ? new Date(syncStartedAt) : null;
    const syncDuration = startTime 
      ? formatDistanceToNow(startTime, { addSuffix: false })
      : "a moment";

    return (
      <Alert className="mb-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30">
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
          <AlertTitle className="text-blue-700 dark:text-blue-300">Syncing Store Data</AlertTitle>
        </div>
        <AlertDescription>
          {startTime 
            ? `Sync started ${formatDistanceToNow(startTime, { addSuffix: true })} and has been running for ${syncDuration}.`
            : "Sync is in progress. This may take a few minutes for large stores."}
        </AlertDescription>
      </Alert>
    );
  }

  // If sync completed recently (within the last hour), show success message
  if (syncStatus === "completed" && syncFinishedAt) {
    const finishTime = new Date(syncFinishedAt);
    const isRecent = Date.now() - finishTime.getTime() < 60 * 60 * 1000; // 1 hour
    
    if (isRecent) {
      return (
        <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950/30">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          <AlertTitle className="text-green-700 dark:text-green-300">Sync Complete</AlertTitle>
          <AlertDescription>
            Store data was successfully synced {formatDistanceToNow(finishTime, { addSuffix: true })}.
          </AlertDescription>
        </Alert>
      );
    }
  }
  
  // Default: don't show anything
  return null;
} 