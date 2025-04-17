import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Define the interface for store sync status
export interface StoreSyncStatus {
  sync_status: string | null;
  sync_started_at: string | null;
  sync_finished_at: string | null;
  updated_at: string | null;
}

// Helper function to get the current store ID
const getCurrentStoreId = async (): Promise<string | null> => {
  try {
    // First try to get from Supabase auth
    const { data } = await supabase.auth.getSession();
    if (data.session?.user?.id) {
      console.log('✅ Store ID from session:', data.session.user.id);
      return data.session.user.id;
    }
    
    // Fallback: if we ever store it in localStorage
    const localStoreId = localStorage.getItem('storeId');
    if (localStoreId) {
      console.log('✅ Store ID from localStorage:', localStoreId);
      return localStoreId;
    }
    
    console.log('❌ No store ID found');
    return null;
  } catch (error) {
    console.error('❌ Error getting store ID:', error);
    return null;
  }
};

export function useStoreSyncStatus() {
  // Get store ID
  const storeIdQuery = useQuery({
    queryKey: ['storeAuth'],
    queryFn: getCurrentStoreId,
  });

  const storeId = storeIdQuery.data;

  // Query the stores table for sync status
  const syncStatusQuery = useQuery({
    queryKey: ['storeSyncStatus', storeId],
    queryFn: async (): Promise<StoreSyncStatus> => {
      // Skip if no store ID is available
      if (!storeId) {
        console.log('⚠️ No store ID available for sync status check');
        return {
          sync_status: 'idle',
          sync_started_at: null,
          sync_finished_at: null,
          updated_at: null
        };
      }
      
      console.log('🔍 Fetching sync status for store:', storeId);
      
      // Query the stores table
      const { data, error } = await supabase
        .from('stores')
        .select('sync_status, sync_started_at, sync_finished_at, updated_at')
        .eq('id', storeId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Error fetching sync status:', error);
        throw error;
      }
      
      // Return default values if no data found
      if (!data) {
        console.log('⚠️ No sync data found for store:', storeId);
        return {
          sync_status: 'idle',
          sync_started_at: null,
          sync_finished_at: null,
          updated_at: null
        };
      }
      
      console.log('✅ Sync status data:', data);
      return data as StoreSyncStatus;
    },
    // Only enable this query when we have a store ID
    enabled: !!storeId,
    // Poll every 4 seconds, but only if syncing
    refetchInterval: (query) => {
      const isSyncing = query.state.data?.sync_status === 'syncing';
      console.log(isSyncing ? '🔄 Polling active (4s)' : '⏸️ Polling disabled');
      return isSyncing ? 4000 : false;
    },
    refetchIntervalInBackground: true,
    staleTime: 5000,
  });

  // Safely type the data
  const syncData = syncStatusQuery.data as StoreSyncStatus | undefined;

  // Return the query result with proper typing
  return {
    syncStatus: syncData?.sync_status || 'idle',
    syncStartedAt: syncData?.sync_started_at,
    syncFinishedAt: syncData?.sync_finished_at,
    updatedAt: syncData?.updated_at,
    isLoading: syncStatusQuery.isLoading || storeIdQuery.isLoading,
    isError: syncStatusQuery.isError || storeIdQuery.isError,
    error: syncStatusQuery.error || storeIdQuery.error,
    refetch: syncStatusQuery.refetch
  };
} 