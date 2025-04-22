import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

/**
 * Redirects to /shopify-login if store is marked as disconnected in DB
 */
export function useStoreAccessGuard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkDisconnected = async () => {
      const session = await supabase.auth.getSession();
      const storeId = session.data.session?.user?.id;

      if (!storeId) return;

      const { data, error } = await supabase
        .from("stores")
        .select("disconnected_at")
        .eq("id", storeId)
        .maybeSingle();

      if (error) return;

      if (data?.disconnected_at) {
        toast({
          title: "Store Disconnected",
          description: "Please reconnect your Shopify store to continue.",
          variant: "destructive",
        });

        navigate("/shopify-login");
      }
    };

    checkDisconnected();
  }, []);
}
