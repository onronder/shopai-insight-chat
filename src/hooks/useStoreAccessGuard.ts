// File: src/hooks/useStoreAccessGuard.ts

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { secureFetch } from "@/lib/secure-fetch";

export function useStoreAccessGuard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkDisconnected = async () => {
      try {
        const response = await secureFetch("/rest/v1/stores?select=disconnected_at", {
          method: "GET",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
          },
        });

        const rows = await response.json();
        const store = Array.isArray(rows) ? rows[0] : null;

        if (store?.disconnected_at) {
          toast({
            title: "Store Disconnected",
            description: "Please reconnect your Shopify store to continue.",
            variant: "destructive",
          });
          navigate("/shopify-login");
        }
      } catch (err) {
        console.error("🔐 Failed to check store access:", err);
        // You can optionally show a toast here if needed
      }
    };

    checkDisconnected();
  }, [navigate, toast]);
}
