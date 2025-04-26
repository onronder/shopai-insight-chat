// File: src/hooks/useEnforceBilling.ts

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlanStatus {
  active: boolean;
  plan: string;
  trial_ends_at: string | null;
}

export function useEnforceBilling() {
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [isTrialActive, setIsTrialActive] = useState<boolean>(false);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState<boolean>(false); // ✅ Add this

  useEffect(() => {
    const checkBillingStatus = async () => {
      try {
        const { data } = await supabase
          .from("store_plans")
          .select("active, plan, trial_ends_at")
          .maybeSingle();

        if (!data) {
          console.error("No plan data found");
          return;
        }

        const now = new Date();
        const trialEndDate = data.trial_ends_at ? new Date(data.trial_ends_at) : null;

        if (trialEndDate) {
          const timeDiff = trialEndDate.getTime() - now.getTime();
          const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          setTrialDaysLeft(daysLeft);

          if (daysLeft > 0) {
            setIsTrialActive(true);
          } else {
            setIsTrialActive(false);
          }
        } else {
          setIsTrialActive(false);
        }

        setIsSubscriptionActive(data.active); // ✅ Set subscription active state

      } catch (err) {
        console.error("Failed to check billing status:", err);
      }
    };

    checkBillingStatus();
  }, []);

  return {
    trialDaysLeft,
    isTrialActive,
    isSubscriptionActive, // ✅ Return it
  };
}
