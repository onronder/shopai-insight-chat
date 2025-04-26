// File: src/components/auth/PlanGate.tsx

import { ReactNode } from "react";
import { useBillingGuard } from "@/hooks/useBillingGuard";
import { Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface PlanGateProps {
  required: "basic" | "pro" | "pro_ai";
  children: ReactNode;
}

export function PlanGate({ required, children }: PlanGateProps) {
  const guard = useBillingGuard({ required });

  if (!guard) return null;

  const { isAuthorized, redirecting, message } = guard;

  if (redirecting) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Alert variant="destructive">
          <AlertTitle>Upgrade Required</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
