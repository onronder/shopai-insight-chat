
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader, Check, ArrowRight, Store } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { storeContext } from "@/hooks/useStoreData";
import { SYNC_STATUS, ROUTES } from "@/utils/constants";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

// Sync status type definition
type SyncStatusType = {
  orders: "pending" | "syncing" | "completed";
  products: "pending" | "syncing" | "completed";
  customers: "pending" | "syncing" | "completed";
};

// Sample questions for AI assistant
const sampleQuestions = [
  "What were my top-selling products last month?",
  "How did my conversion rate change after the last promotion?",
  "Which customer segment has the highest lifetime value?",
  "What's my average order value compared to last quarter?",
  "Identify products with high return rates",
  "Which marketing channel brings the most revenue?"
];

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>({
    orders: "syncing",
    products: "pending",
    customers: "pending",
  });
  
  const [syncProgress, setSyncProgress] = useState(15);
  const [syncComplete, setSyncComplete] = useState(false);
  
  // Initial loading simulation
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(loadingTimer);
  }, []);
  
  // Simulate sync progress
  useEffect(() => {
    if (loading) return;
    
    const timer = setTimeout(() => {
      if (syncProgress >= 100) {
        setSyncComplete(true);
        toast({
          title: "Sync complete",
          description: "Your store data has been successfully imported"
        });
        return;
      }
      
      // Update sync status based on progress
      if (syncProgress > 15 && syncProgress < 40) {
        setSyncStatus(prev => ({ ...prev, orders: "completed", products: "syncing" }));
      } else if (syncProgress >= 40 && syncProgress < 90) {
        setSyncStatus(prev => ({ ...prev, products: "completed", customers: "syncing" }));
      } else if (syncProgress >= 90) {
        setSyncStatus(prev => ({ ...prev, customers: "completed" }));
      }
      
      setSyncProgress(prev => Math.min(prev + 5, 100));
    }, 600);
    
    return () => clearTimeout(timer);
  }, [syncProgress, loading]);
  
  const goToDashboard = () => {
    navigate(ROUTES.DASHBOARD);
  };
  
  const skipAndExplore = () => {
    navigate(ROUTES.DASHBOARD);
  };
  
  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  const renderSyncStatus = (status: "pending" | "syncing" | "completed") => {
    switch (status) {
      case "completed":
        return <Check className="h-5 w-5 text-green-500" />;
      case "syncing":
        return <Loader className="h-5 w-5 text-primary animate-spin" />;
      case "pending":
        return <div className="h-5 w-5 rounded-full border border-muted" />;
    }
  };

  const storeName = storeContext.shopDomain.split('.')[0];

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Welcome to ShopAI Insight, <span className="text-primary">{storeName}</span> 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          We're syncing your Shopify store data to personalize your experience.
        </p>
      </div>
      
      {/* Sync Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Syncing Your Store Data
          </CardTitle>
          <CardDescription>
            We're syncing your orders, products, and customers from Shopify.
            This may take 1–2 minutes depending on your store size.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Sync Progress</span>
              <span className="text-sm font-medium">{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              {renderSyncStatus(syncStatus.orders)}
              <span className={syncStatus.orders === "completed" ? "text-foreground" : "text-muted-foreground"}>
                Syncing Orders
              </span>
              {syncStatus.orders === "completed" && (
                <Badge variant="success" className="ml-auto">Completed</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {renderSyncStatus(syncStatus.products)}
              <span className={syncStatus.products === "completed" ? "text-foreground" : "text-muted-foreground"}>
                Syncing Products
              </span>
              {syncStatus.products === "completed" && (
                <Badge variant="success" className="ml-auto">Completed</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {renderSyncStatus(syncStatus.customers)}
              <span className={syncStatus.customers === "completed" ? "text-foreground" : "text-muted-foreground"}>
                Syncing Customers
              </span>
              {syncStatus.customers === "completed" && (
                <Badge variant="success" className="ml-auto">Completed</Badge>
              )}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground italic">
            {syncComplete 
              ? "All data has been synced. You're ready to explore!" 
              : "Please wait while we prepare your dashboard..."}
          </div>
        </CardContent>
      </Card>
      
      {/* What You Can Do Card */}
      <Card>
        <CardHeader>
          <CardTitle>What You Can Do With ShopAI</CardTitle>
          <CardDescription>
            ShopAI Insight helps you gain meaningful insights from your Shopify store data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Understand sales trends</p>
                <p className="text-sm text-muted-foreground">
                  Get clear visualizations of your sales performance over time
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Segment your customers</p>
                <p className="text-sm text-muted-foreground">
                  Identify your VIPs, at-risk customers, and growth opportunities
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Chat with your store data</p>
                <p className="text-sm text-muted-foreground">
                  Ask questions in plain English and get instant insights
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Visualize performance with clean dashboards</p>
                <p className="text-sm text-muted-foreground">
                  At-a-glance metrics and KPIs to track your business growth
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
      
      {/* Sample Questions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Try asking the AI...</CardTitle>
          <CardDescription>
            Once setup is complete, you can ask ShopAI questions about your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sampleQuestions.map((question, index) => (
              <Button 
                key={index} 
                variant="outline" 
                className="justify-start h-auto py-3 px-4"
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Separator className="my-6" />
      
      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Button 
          variant="outline" 
          onClick={skipAndExplore}
          className="order-2 sm:order-1"
        >
          Skip and explore
        </Button>
        
        <Button 
          onClick={goToDashboard} 
          disabled={!syncComplete}
          className="order-1 sm:order-2 gap-2"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Welcome;
