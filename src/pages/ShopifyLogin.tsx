// File: src/pages/ShopifyLogin.tsx

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, BarChart, Brain, Sparkles, AlertCircle } from "lucide-react";
import { useShopifyAuthGuard } from "@/hooks/useShopifyAuthGuard"; // ✅ Added this

const ShopifyLogin: React.FC = () => {
  useShopifyAuthGuard(); // ✅ Protect missing host/shop

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDataUsage, setAcceptedDataUsage] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const isFormValid = acceptedTerms && acceptedDataUsage;

  const handleConnectStore = () => {
    if (!isFormValid) {
      setAttemptedSubmit(true);
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const shop = searchParams.get("shop");
    const host = searchParams.get("host");

    if (!shop || !host) {
      console.error("❌ No shop or host found in URL");
      return;
    }

    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/functions/v1/shopify_auth_start?shop=${encodeURIComponent(shop)}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-shopify-light via-white to-shopify-light p-4">
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/90 backdrop-blur-sm relative overflow-hidden">
        <CardHeader className="text-center relative z-10">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-shopify-primary to-shopify-accent flex items-center justify-center shadow-lg">
            <ShoppingBag className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-shopify-primary to-shopify-secondary">
            Welcome to ShopAI Insight
          </CardTitle>
          <CardDescription className="mt-2 text-slate-600 text-base">
            Connect your Shopify store to unlock powerful AI insights
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center relative z-10">
          <div className="w-full p-6 rounded-lg bg-gradient-to-br from-white to-slate-50 shadow-inner">
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              {[{ Icon: BarChart, label: "Smart Analytics" }, { Icon: Brain, label: "AI Insights" }, { Icon: Sparkles, label: "Growth Tools" }].map(({ Icon, label }, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="mb-2 h-10 w-10 rounded-full bg-shopify-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-shopify-primary" />
                  </div>
                  <span className="text-xs text-slate-600">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-slate-600 text-sm">
              Manage your store smarter with real-time AI insights
            </p>
          </div>

          <div className="w-full mt-6 space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(v) => setAcceptedTerms(v === true)} className="mt-1" />
              <label htmlFor="terms" className="text-sm text-slate-600 leading-tight">
                I accept the <Link to="/terms" className="text-shopify-primary hover:underline">Terms of Use</Link> and <Link to="/privacy" className="text-shopify-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox id="dataUsage" checked={acceptedDataUsage} onCheckedChange={(v) => setAcceptedDataUsage(v === true)} className="mt-1" />
              <label htmlFor="dataUsage" className="text-sm text-slate-600 leading-tight">
                I agree to the use of store analytics and personal data for insights
              </label>
            </div>
            {attemptedSubmit && !isFormValid && (
              <div className="flex items-center text-amber-600 text-sm mt-2">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Please accept both agreements to continue</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="relative z-10 mt-4">
          <Tooltip open={attemptedSubmit && !isFormValid}>
            <TooltipTrigger asChild>
              <div className="w-full">
                <Button
                  className="w-full bg-gradient-to-r from-shopify-primary to-shopify-secondary hover:from-shopify-secondary hover:to-shopify-primary shadow-md disabled:opacity-60"
                  size="lg"
                  onClick={handleConnectStore}
                  disabled={!isFormValid}
                >
                  Connect Your Shopify Store <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-amber-50 text-amber-700 border border-amber-200">
              Please accept both agreements first
            </TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
      <p className="mt-6 text-xs text-slate-500">© 2025 ShopAI Insight. All rights reserved.</p>
    </div>
  );
};

export default ShopifyLogin;
