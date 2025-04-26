// File: src/pages/billing/index.tsx

import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBillingInfo } from "@/hooks/useBillingInfo";
import { usePlanActions } from "@/hooks/usePlanActions";
import { Skeleton } from "@/components/ui/skeleton";

const BillingPage: React.FC = () => {
  const { data: billingInfo, isLoading } = useBillingInfo();
  const { upgradePlan, downgradePlan, cancelSubscription, isLoading: actionLoading } = usePlanActions();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Skeleton className="h-10 w-1/2 mb-6" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!billingInfo) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Info Unavailable</CardTitle>
            <CardDescription>We couldn't load your subscription details. Please refresh.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isTrialActive = billingInfo.trial_ends_at && new Date(billingInfo.trial_ends_at) > new Date();
  const isSubscriptionActive = billingInfo.subscription_status === "active";

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Subscription</CardTitle>
          <CardDescription>View and manage your current billing plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan:</p>
            <p className="capitalize font-semibold">{billingInfo.plan}</p>
          </div>

          {isTrialActive ? (
            <div>
              <p className="text-sm text-muted-foreground">Trial Ends:</p>
              <p className="font-semibold">{new Date(billingInfo.trial_ends_at!).toLocaleDateString()}</p>
            </div>
          ) : isSubscriptionActive ? (
            <>
              <div>
                <p className="text-sm text-muted-foreground">Next Billing Date:</p>
                <p className="font-semibold">{billingInfo.billing_on ? new Date(billingInfo.billing_on).toLocaleDateString() : "N/A"}</p>
              </div>
            </>
          ) : (
            <div className="text-destructive">No active subscription found.</div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row gap-4">
          <Button disabled={actionLoading} onClick={() => upgradePlan("basic")}>Upgrade to Basic</Button>
          <Button disabled={actionLoading} onClick={() => upgradePlan("pro")}>Upgrade to Pro</Button>
          <Button disabled={actionLoading} onClick={() => upgradePlan("pro_ai")}>Upgrade to Pro AI</Button>
          {isSubscriptionActive && (
            <Button variant="destructive" disabled={actionLoading} onClick={cancelSubscription}>
              Cancel Subscription
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default BillingPage;
