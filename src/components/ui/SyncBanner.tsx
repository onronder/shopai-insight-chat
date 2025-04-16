import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useStoreSyncStatus } from "@/hooks/useStoreSyncStatus";
import { AlertTriangle } from "lucide-react";

export const SyncBanner = () => {
  const { data: syncStatus } = useStoreSyncStatus();

  if (!syncStatus || syncStatus === "completed") return null;

  return (
    <Alert variant="warning" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Store syncing in progress</AlertTitle>
      <AlertDescription>
        Your store is still syncing data. Some pages may appear empty until this is complete.
      </AlertDescription>
    </Alert>
  );
};
