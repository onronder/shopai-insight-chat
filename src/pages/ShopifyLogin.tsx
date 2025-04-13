
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBag } from 'lucide-react';

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to ShopAI Insight</CardTitle>
          <CardDescription className="mt-2">
            Connect your Shopify store to access AI-powered analytics and insights
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center">
          <div className="relative w-full h-32 mb-4 overflow-hidden rounded-md bg-muted/50">
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Unlock powerful AI analytics for your Shopify store</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            className="w-full"
            size="lg"
            onClick={handleConnectStore}
          >
            Connect your Shopify Store
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ShopifyLogin;
