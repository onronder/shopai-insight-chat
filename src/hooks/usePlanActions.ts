// File: src/hooks/usePlanActions.ts

import { useState } from "react";
import { secureFetch } from "@/lib/secure-fetch";
import { useToast } from "@/components/ui/use-toast";

interface UsePlanActionsResult {
  isLoading: boolean;
  upgradePlan: (planName: string) => Promise<void>;
  downgradePlan: (planName: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

export function usePlanActions(): UsePlanActionsResult {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const upgradePlan = async (planName: string) => {
    setIsLoading(true);
    try {
      const session = await fetch("/auth/session").then(res => res.json());
      const store_id = session?.user?.id;

      if (!store_id) {
        throw new Error("Store ID not found");
      }

      // First cancel existing plan
      const cancelRes = await secureFetch("/functions/v1/shopify_cancel_subscription", {
        method: "POST",
        body: JSON.stringify({ store_id }),
      });

      if (!cancelRes.ok) {
        const cancelError = await cancelRes.text();
        throw new Error(`Failed to cancel existing subscription: ${cancelError}`);
      }

      // Then start billing new plan
      const billingRes = await secureFetch("/functions/v1/shopify_create_billing_session", {
        method: "POST",
        body: JSON.stringify({ store_id, plan: planName }),
      });

      if (!billingRes.ok) {
        const billingError = await billingRes.text();
        throw new Error(`Failed to create billing session: ${billingError}`);
      }

      const { confirmation_url } = await billingRes.json();

      if (!confirmation_url) {
        throw new Error("Billing confirmation URL not found");
      }

      window.location.href = confirmation_url;

    } catch (err) {
      console.error("Upgrade Plan Error:", err);
      toast({
        title: "Upgrade failed",
        description: (err as Error)?.message || "Unknown error during upgrade.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downgradePlan = async (planName: string) => {
    await upgradePlan(planName);
  };

  const cancelSubscription = async () => {
    setIsLoading(true);
    try {
      const session = await fetch("/auth/session").then(res => res.json());
      const store_id = session?.user?.id;

      if (!store_id) {
        throw new Error("Store ID not found");
      }

      const cancelRes = await secureFetch("/functions/v1/shopify_cancel_subscription", {
        method: "POST",
        body: JSON.stringify({ store_id }),
      });

      if (!cancelRes.ok) {
        const cancelError = await cancelRes.text();
        throw new Error(`Failed to cancel subscription: ${cancelError}`);
      }

      toast({
        title: "Subscription canceled",
        description: "Your subscription has been canceled. You can continue to use the app until the end of your billing cycle.",
      });

      // Optionally refresh the page or redirect
      window.location.reload();

    } catch (err) {
      console.error("Cancel Subscription Error:", err);
      toast({
        title: "Cancellation failed",
        description: (err as Error)?.message || "Unknown error during cancellation.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    upgradePlan,
    downgradePlan,
    cancelSubscription,
  };
}
