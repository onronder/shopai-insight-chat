// File: src/hooks/useBillingGuard.ts

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { secureFetch } from "@/lib/secure-fetch";

type PlanTier = "basic" | "pro" | "pro_ai";

interface BillingGuardConfig {
  required: PlanTier;
}

interface BillingGuardResult {
  isAuthorized: boolean;
  redirecting: boolean;
  message: string | null;
}

export function useBillingGuard(config: BillingGuardConfig): BillingGuardResult {
  const { required } = config;
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirecting, setRedirecting] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkPlan = async () => {
      try {
        const res = await secureFetch("/functions/v1/get_current_plan");

        if (!res.ok) {
          throw new Error("Failed to retrieve current billing plan");
        }

        const { plan, active, trial_ends_at } = await res.json();

        if (!active) {
          setMessage("Your subscription is not active.");
          return;
        }

        const planPriority: Record<PlanTier, number> = {
          basic: 1,
          pro: 2,
          pro_ai: 3,
        };

        if (planPriority[plan as PlanTier] >= planPriority[required]) {
          setIsAuthorized(true);
        } else {
          setMessage("This feature requires a higher subscription tier.");
        }
      } catch (err) {
        console.error("BillingGuard Error:", err);
        setMessage("Unable to verify billing plan.");
      } finally {
        setRedirecting(false);
      }
    };

    checkPlan();
  }, [required]);

  return {
    isAuthorized,
    redirecting,
    message,
  };
}
