// File: src/hooks/useStoreSyncStatus.ts

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { secureFetch } from "@/lib/secure-fetch";

export interface StoreSyncStatus {
  sync_status: "idle" | "syncing" | "completed" | "failed" | null;
  sync_started_at: string | null;
  sync_finished_at: string | null;
  updated_at: string | null;
  shop_domain?: string | null;
}

const validStatus = ["idle", "syncing", "completed", "failed"] as const;
type ValidStatus = (typeof validStatus)[number];

const getCurrentStoreId = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? localStorage.getItem("storeId") ?? null;
  } catch (error) {
    console.error("❌ Failed to retrieve store ID:", error);
    return null;
  }
};

export function useStoreSyncStatus() {
  const storeIdQuery = useQuery({
    queryKey: ["storeAuth"],
    queryFn: getCurrentStoreId,
  });

  const storeId = storeIdQuery.data;

  const syncStatusQuery = useQuery<StoreSyncStatus>({
    queryKey: ["storeSyncStatus", storeId],
    queryFn: async () => {
      if (!storeId) {
        return {
          sync_status: "idle",
          sync_started_at: null,
          sync_finished_at: null,
          updated_at: null,
          shop_domain: null,
        };
      }

      const res = await secureFetch(
        `/rest/v1/stores?select=sync_status,sync_started_at,sync_finished_at,updated_at,shop_domain&id=eq.${storeId}`
      );
      const result = await res.json();

      const data = result?.[0];

      const incoming = data?.sync_status;
      const status: ValidStatus = validStatus.includes(incoming as ValidStatus)
        ? (incoming as ValidStatus)
        : "idle";

      return {
        sync_status: status,
        sync_started_at: data?.sync_started_at ?? null,
        sync_finished_at: data?.sync_finished_at ?? null,
        updated_at: data?.updated_at ?? null,
        shop_domain: data?.shop_domain ?? null,
      };
    },
    enabled: !!storeId,
    refetchInterval: (query) =>
      query.state.data?.sync_status === "syncing" ? 4000 : false,
    refetchIntervalInBackground: true,
    staleTime: 5000,
  });

  const syncData = syncStatusQuery.data;

  return {
    syncStatus: syncData?.sync_status ?? "idle",
    syncStartedAt: syncData?.sync_started_at,
    syncFinishedAt: syncData?.sync_finished_at,
    updatedAt: syncData?.updated_at,
    storeDomain: syncData?.shop_domain ?? null,
    isLoading: storeIdQuery.isLoading || syncStatusQuery.isLoading,
    isError: storeIdQuery.isError || syncStatusQuery.isError,
    error: storeIdQuery.error || syncStatusQuery.error,
    refetch: syncStatusQuery.refetch,
    storeId,
    isSyncing: syncData?.sync_status === "syncing",
    isSynced: syncData?.sync_status === "completed",
    isFailed: syncData?.sync_status === "failed",
  };
}
