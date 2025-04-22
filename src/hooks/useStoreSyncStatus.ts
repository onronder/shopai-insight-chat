import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StoreSyncStatus {
  sync_status: 'idle' | 'syncing' | 'completed' | 'failed' | null;
  sync_started_at: string | null;
  sync_finished_at: string | null;
  updated_at: string | null;
  shop_domain?: string | null;
}

const getCurrentStoreId = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user?.id) return data.session.user.id;

    const localStoreId = localStorage.getItem('storeId');
    return localStoreId || null;
  } catch (error) {
    console.error('❌ Failed to retrieve store ID:', error);
    return null;
  }
};

export function useStoreSyncStatus() {
  const storeIdQuery = useQuery({
    queryKey: ['storeAuth'],
    queryFn: getCurrentStoreId,
  });

  const storeId = storeIdQuery.data;

  const syncStatusQuery = useQuery({
    queryKey: ['storeSyncStatus', storeId],
    queryFn: async (): Promise<StoreSyncStatus> => {
      if (!storeId) {
        return {
          sync_status: 'idle',
          sync_started_at: null,
          sync_finished_at: null,
          updated_at: null,
          shop_domain: null,
        };
      }

      const { data, error } = await supabase
        .from('stores')
        .select('sync_status, sync_started_at, sync_finished_at, updated_at, shop_domain')
        .eq('id', storeId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const validStatus = ['idle', 'syncing', 'completed', 'failed'] as const;
      type ValidStatus = typeof validStatus[number];

      const status: ValidStatus =
        validStatus.includes(data?.sync_status as ValidStatus)
          ? (data?.sync_status as ValidStatus)
          : 'idle';

      return {
        sync_status: status,
        sync_started_at: data?.sync_started_at ?? null,
        sync_finished_at: data?.sync_finished_at ?? null,
        updated_at: data?.updated_at ?? null,
        shop_domain: data?.shop_domain ?? null,
      };
    },
    enabled: !!storeId,
    refetchInterval: (query) => {
      const status = query.state.data?.sync_status;
      return status === 'syncing' ? 4000 : false;
    },
    refetchIntervalInBackground: true,
    staleTime: 5000,
  });

  const syncData = syncStatusQuery.data;

  const isSyncing = syncData?.sync_status === 'syncing';
  const isSynced = syncData?.sync_status === 'completed';
  const isFailed = syncData?.sync_status === 'failed';

  return {
    syncStatus: syncData?.sync_status || 'idle',
    syncStartedAt: syncData?.sync_started_at,
    syncFinishedAt: syncData?.sync_finished_at,
    updatedAt: syncData?.updated_at,
    storeDomain: syncData?.shop_domain ?? null,
    isLoading: storeIdQuery.isLoading || syncStatusQuery.isLoading,
    isError: syncStatusQuery.isError || storeIdQuery.isError,
    error: syncStatusQuery.error || storeIdQuery.error,
    refetch: syncStatusQuery.refetch,
    storeId,
    isSyncing,
    isSynced,
    isFailed,
  };
}
