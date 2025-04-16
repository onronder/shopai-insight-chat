import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStoreSyncStatus = () => {
  return useQuery({
    queryKey: ["store_sync_status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("sync_status")
        .single();
      if (error) throw error;
      return data.sync_status;
    },
    refetchInterval: 5000
  });
};
