// File: src/pages/ShopifyLogin.tsx

import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, BarChart, Brain, Sparkles, AlertCircle } from "lucide-react";

const ShopifyLogin: React.FC = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDataUsage, setAcceptedDataUsage] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const isFormValid = acceptedTerms && acceptedDataUsage;

  const handleConnectStore = async () => {
    if (!isFormValid) {
      setAttemptedSubmit(true);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const shop = params.get("shop");

    if (!shop) {
      console.error("❌ No shop found in URL");
      return;
    }

    window.location.href = `/auth?shop=${encodeURIComponent(shop)}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-shopify-light via-white to-shopify-light p-4">
      <Card className="w-full max-w-md shadow-xl bg-white/90 backdrop-blur-sm border-0">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-shopify-primary to-shopify-accent flex items-center justify-center shadow-lg">
            <ShoppingBag className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-shopify-primary to-shopify-secondary">
            Welcome to ShopAI Insight
          </CardTitle>
          <CardDescription className="mt-2 text-slate-600">
            Connect your store to unlock AI-powered analytics.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center">
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(v) => setAcceptedTerms(v === true)} />
              <label htmlFor="terms" className="text-sm text-slate-600">
                I accept the <Link to="/terms" className="text-shopify-primary hover:underline">Terms of Use</Link> and <Link to="/privacy" className="text-shopify-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox id="data" checked={acceptedDataUsage} onCheckedChange={(v) => setAcceptedDataUsage(v === true)} />
              <label htmlFor="data" className="text-sm text-slate-600">
                I allow analytics and personal data usage.
              </label>
            </div>
            {attemptedSubmit && !isFormValid && (
              <div className="text-amber-600 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Please accept both agreements.
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="mt-4">
          <Tooltip open={attemptedSubmit && !isFormValid}>
            <TooltipTrigger asChild>
              <Button
                className="w-full bg-gradient-to-r from-shopify-primary to-shopify-secondary hover:from-shopify-secondary hover:to-shopify-primary"
                size="lg"
                onClick={handleConnectStore}
                disabled={!isFormValid}
              >
                Connect Store <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Accept agreements to continue.</TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ShopifyLogin;
