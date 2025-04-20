import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StoreSyncStatus {
  sync_status: 'idle' | 'syncing' | 'completed' | 'failed' | null;
  sync_started_at: string | null;
  sync_finished_at: string | null;
  updated_at: string | null;
}

// Get store ID from Supabase session or localStorage fallback
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
          updated_at: null
        };
      }

      const { data, error } = await supabase
        .from('stores')
        .select('sync_status, sync_started_at, sync_finished_at, updated_at')
        .eq('id', storeId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      return data || {
        sync_status: 'idle',
        sync_started_at: null,
        sync_finished_at: null,
        updated_at: null
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
