import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useBillingInfo } from "@/hooks/useBillingInfo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { secureFetch } from "@/lib/secure-fetch";

export const SubscriptionSettings: React.FC = () => {
  const { data: billingInfo, isLoading, refetch } = useBillingInfo();
  const { toast } = useToast();

  const handleChangePlan = async () => {
    try {
      const res = await secureFetch("/functions/v1/shopify_create_billing_session", {
        method: "POST",
        body: JSON.stringify({
          store_id: billingInfo?.store_id,
          current_plan: billingInfo?.plan,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create billing session");
      }

      const data = await res.json();
      if (data?.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else {
        throw new Error("No confirmation URL returned");
      }
    } catch (error) {
      console.error("Billing redirect error:", error);
      toast({
        title: "Error",
        description: "Failed to redirect to billing portal.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-6">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-5 w-1/2" />
        </CardHeader>
        <CardContent className="p-6">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!billingInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Info Unavailable</CardTitle>
          <CardDescription>We couldn't load your subscription details.</CardDescription>
        </CardHeader>
        <CardFooter className="p-6">
          <Button onClick={() => refetch()}>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  const {
    plan,
    trial_ends_at,
    subscription_created_at,
    subscription_status,
    billing_interval,
    billing_on,
  } = billingInfo;

  const isTrialActive = trial_ends_at && new Date(trial_ends_at) > new Date();
  const isSubscriptionActive = subscription_status === "active";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Your Subscription</CardTitle>
        <CardDescription>View and update your current billing plan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="font-medium">Current Plan:</p>
          <p className="text-muted-foreground capitalize">{plan}</p>
        </div>

        {isTrialActive ? (
          <div className="space-y-1">
            <p className="font-medium">Trial Ends:</p>
            <p className="text-muted-foreground">{new Date(trial_ends_at).toLocaleDateString()}</p>
          </div>
        ) : isSubscriptionActive ? (
          <>
            <div className="space-y-1">
              <p className="font-medium">Subscription Started:</p>
              <p className="text-muted-foreground">{new Date(subscription_created_at!).toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Billing Interval:</p>
              <p className="text-muted-foreground">{billing_interval === "annual" ? "Yearly" : "Monthly"}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">Next Billing Date:</p>
              <p className="text-muted-foreground">{new Date(billing_on!).toLocaleDateString()}</p>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground italic">No active subscription</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button variant="default" onClick={handleChangePlan}>
          {isTrialActive ? "Choose Plan" : "Change Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
};
