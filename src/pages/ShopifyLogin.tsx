// File: src/pages/ShopifyLogin.tsx

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag, Sparkles, BarChart, Brain, AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';

const ShopifyLogin: React.FC = () => {
  const navigate = useNavigate();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDataUsage, setAcceptedDataUsage] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [storeDomain, setStoreDomain] = useState<string | null>(null);

  const isFormValid = acceptedTerms && acceptedDataUsage;

  useEffect(() => {
    const checkSessionAndStore = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const storeId = sessionData.session?.user?.id;

      if (!storeId) return;

      const { data: store, error } = await supabase
        .from('stores')
        .select('shop_domain, sync_status')
        .eq('id', storeId)
        .maybeSingle();

      if (error) {
        console.error('❌ Failed to fetch store info', error);
        return;
      }

      if (store?.sync_status === 'completed') {
        navigate('/dashboard');
      } else if (store?.shop_domain) {
        setStoreDomain(store.shop_domain);
      }
    };

    checkSessionAndStore();
  }, [navigate]);

  async function logConsent() {
    if (!storeDomain) return;

    const { error } = await supabase.from('user_consent_logs').insert({
      store_domain: storeDomain,
      accepted_terms: true,
      accepted_privacy: true,
      accepted_data_usage: true,
    });

    if (error) {
      console.error('❌ Failed to log consent', error);
    } else {
      console.log('✅ Consent logged successfully');
    }
  }

  const handleConnectStore = async () => {
    if (!isFormValid) {
      setAttemptedSubmit(true);
      return;
    }

    if (!storeDomain) {
      console.error('❌ No store domain found');
      return;
    }

    await logConsent();

    const baseUrl = window.location.origin;
    const authUrl = `${baseUrl}/functions/v1/shopify_auth_start?shop=${storeDomain}`;
    window.location.href = authUrl;
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
            Connect your Shopify store to access AI-powered analytics and insights
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center relative z-10">
          <div className="w-full p-6 rounded-lg bg-gradient-to-br from-white to-slate-50 shadow-inner">
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              {[{ Icon: BarChart, label: 'Smart Analytics' }, { Icon: Brain, label: 'AI Insights' }, { Icon: Sparkles, label: 'Growth Tools' }].map(({ Icon, label }, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="mb-2 h-10 w-10 rounded-full bg-shopify-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-shopify-primary" />
                  </div>
                  <span className="text-xs text-slate-600">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-slate-600 text-sm">
              Unlock powerful AI analytics tailored specifically for your Shopify store
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
              <Checkbox id="data-usage" checked={acceptedDataUsage} onCheckedChange={(v) => setAcceptedDataUsage(v === true)} className="mt-1" />
              <label htmlFor="data-usage" className="text-sm text-slate-600 leading-tight">
                I acknowledge that analytics and personal data may be used for insight generation
              </label>
            </div>
            {attemptedSubmit && !isFormValid && (
              <div className="flex items-center text-amber-600 text-sm mt-2">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Please accept both terms to continue</span>
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
                  Connect your Shopify Store <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-amber-50 text-amber-700 border border-amber-200">
              Please accept both terms to continue
            </TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
      <p className="mt-6 text-xs text-slate-500">© 2025 ShopAI Insight. All rights reserved.</p>
    </div>
  );
};

export default ShopifyLogin;
