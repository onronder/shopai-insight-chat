// File: src/components/billing/BillingReminderBanner.tsx

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useEnforceBilling } from "@/hooks/useEnforceBilling";

export function BillingReminderBanner() {
  const navigate = useNavigate();
  const { trialDaysLeft, isTrialActive, isSubscriptionActive } = useEnforceBilling();

  if (isSubscriptionActive) {
    return null; // ✅ No need to show anything if subscription is active
  }

  return (
    <Alert variant="default" className="mb-4">
      <Info className="h-5 w-5" />
      <AlertTitle>Billing Notice</AlertTitle>
      <AlertDescription>
        {isTrialActive && trialDaysLeft !== null ? (
          <>
            Your free trial ends in <strong>{trialDaysLeft}</strong> {trialDaysLeft === 1 ? "day" : "days"}.<br/>
            Please activate a plan to continue using ShopAI Insight.
          </>
        ) : (
          <>
            Your free trial has ended.<br/>
            Please choose a plan to continue using ShopAI Insight.
          </>
        )}

        <div className="mt-4">
          <Button variant="default" size="sm" onClick={() => navigate("/billing")}> {/* Always navigate to /billing */}
            {isTrialActive ? "Choose a Plan" : "Subscribe Now"}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}