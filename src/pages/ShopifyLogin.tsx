
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag, Sparkles, BarChart, Brain } from 'lucide-react';

/**
 * ShopifyLogin page - OAuth entry point for Shopify merchants
 * This page doesn't include a regular login form, just a CTA to connect a Shopify store
 */
const ShopifyLogin: React.FC = () => {
  const handleConnectStore = () => {
    // TODO: Replace with dynamic shop parameter from user input
    window.location.href = 'https://your-backend-domain.com/functions/v1/shopify_oauth_callback?shop=demo.myshopify.com';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-shopify-light via-white to-shopify-light p-4">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 md:left-20 w-24 h-24 rounded-full bg-shopify-accent/10 blur-2xl" />
      <div className="absolute bottom-20 right-10 md:right-20 w-32 h-32 rounded-full bg-shopify-primary/10 blur-2xl" />
      
      <Card className="w-full max-w-md border-0 shadow-xl bg-white/90 backdrop-blur-sm relative overflow-hidden">
        {/* Card decorative corner accents */}
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-shopify-accent/20 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-shopify-primary/20 rounded-full" />
        
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
          <div className="relative w-full p-6 rounded-lg bg-gradient-to-br from-white to-slate-50 shadow-inner">
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div className="flex flex-col items-center">
                <div className="mb-2 h-10 w-10 rounded-full bg-shopify-primary/10 flex items-center justify-center">
                  <BarChart className="h-5 w-5 text-shopify-primary" />
                </div>
                <span className="text-xs text-slate-600">Smart Analytics</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-2 h-10 w-10 rounded-full bg-shopify-primary/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-shopify-primary" />
                </div>
                <span className="text-xs text-slate-600">AI Insights</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="mb-2 h-10 w-10 rounded-full bg-shopify-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-shopify-primary" />
                </div>
                <span className="text-xs text-slate-600">Growth Tools</span>
              </div>
            </div>
            <p className="text-center text-slate-600 text-sm">
              Unlock powerful AI analytics tailored specifically for your Shopify store
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="relative z-10">
          <Button 
            className="w-full bg-gradient-to-r from-shopify-primary to-shopify-secondary hover:from-shopify-secondary hover:to-shopify-primary transition-all duration-300 shadow-md"
            size="lg"
            onClick={handleConnectStore}
          >
            Connect your Shopify Store
            <ArrowRight className="ml-2 h-5 w-5 animate-pulse" />
          </Button>
        </CardFooter>
      </Card>
      
      <p className="mt-6 text-xs text-slate-500">© 2025 ShopAI Insight. All rights reserved.</p>
    </div>
  );
};

export default ShopifyLogin;
