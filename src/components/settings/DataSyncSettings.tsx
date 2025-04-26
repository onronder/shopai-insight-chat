// File: src/components/settings/DataSyncSettings.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RotateCw, Clock } from "lucide-react";
import { secureFetch } from "@/lib/secure-fetch";
import { useToast } from "@/components/ui/use-toast";

interface StoreSyncStatus {
  sync_status: string;
  sync_started_at: string | null;
  sync_finished_at: string | null;
}

export default function DataSyncSettings() {
  const { toast } = useToast();

  const [syncStatus, setSyncStatus] = useState<StoreSyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadSyncStatus = useCallback(async () => {
    try {
      const res = await secureFetch("/rest/v1/stores?select=sync_status,sync_started_at,sync_finished_at&limit=1");
      if (!res.ok) throw new Error("Failed to fetch sync status");
      const [data] = await res.json();
      setSyncStatus(data);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await secureFetch("/functions/v1/shopify_sync_orders", { method: "POST" });
      if (!res.ok) throw new Error("Failed to trigger manual sync");

      toast({ title: "Sync triggered successfully" });
      await loadSyncStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadSyncStatus();
  }, [loadSyncStatus]);

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading || !syncStatus) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Sync Status</CardTitle>
        <CardDescription>
          Monitor and trigger store data synchronization manually
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm">
          <p>
            <strong>Current Sync Status:</strong> {syncStatus.sync_status}
          </p>
          <p>
            <strong>Last Sync Started:</strong> {formatDateTime(syncStatus.sync_started_at)}
          </p>
          <p>
            <strong>Last Sync Finished:</strong> {formatDateTime(syncStatus.sync_finished_at)}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleManualSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <>
              <RotateCw className="mr-2 h-4 w-4 animate-spin" /> Syncing...
            </>
          ) : (
            <>
              <RotateCw className="mr-2 h-4 w-4" /> Run Manual Sync
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
