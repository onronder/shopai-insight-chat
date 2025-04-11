
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { 
  AlertTriangle, 
  Check, 
  Clock, 
  RotateCw, 
  Trash2
} from "lucide-react";

import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/layout/ModeToggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { useStoreData } from "@/hooks/useStoreData";

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [responseLength, setResponseLength] = useState([50]);
  
  // Use the store data hook to fetch settings
  const { data: settings, isLoading: pageLoading, error } = useStoreData({
    timeRange: "30",
    allowStaffAccess: true,
    responseTone: "neutral",
    storeGoal: "Increase repeat customer revenue by 15%",
    syncInterval: "daily",
    optOutAnalytics: false,
  }, 1500);
  
  // Check if settings object is empty (indicating no saved preferences)
  const hasNoSettings = !pageLoading && settings && Object.keys(settings).length === 0;
  
  // TODO: Replace with API call to fetch user settings from backend
  const { handleSubmit, formState } = useForm({
    defaultValues: settings
  });

  const onSubmit = () => {
    setIsLoading(true);
    // TODO: Replace with API call to save settings to backend
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Success",
        description: "Settings saved successfully"
      });
    }, 1000);
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    // TODO: Replace with API call to trigger data synchronization
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: "Data sync completed",
        description: "All your store data has been synchronized"
      });
    }, 2000);
  };

  const handleDeleteHistory = () => {
    setConfirmDialogOpen(false);
    // TODO: Replace with API call to delete chat history
    toast({
      title: "History deleted",
      description: "AI chat history deleted successfully"
    });
  };

  if (pageLoading) {
    return (
      <AppLayout>
        <PageHeader 
          title="Settings" 
          description="Manage your store preferences and application settings"
        />
        <div className="container max-w-4xl pb-20">
          <LoadingState message="Loading your preferences..." />
          <div className="space-y-6 mt-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (hasNoSettings) {
    return (
      <AppLayout>
        <PageHeader 
          title="Settings" 
          description="Manage your store preferences and application settings"
        />
        <div className="container max-w-4xl pb-20">
          <EmptyState
            title="No Settings Found"
            description="We couldn't find any saved preferences for your store. Start customizing your experience by using the default settings below."
            actionLabel="Initialize Settings"
            onAction={() => window.location.reload()}
          />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <PageHeader 
          title="Settings" 
          description="Manage your store preferences and application settings"
        />
        <div className="container max-w-4xl pb-20">
          <EmptyState
            title="Error Loading Settings"
            description="We encountered an error while loading your settings. Please try again later."
            actionLabel="Try Again"
            onAction={() => window.location.reload()}
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-4xl pb-20">
        <PageHeader 
          title="Settings" 
          description="Manage your store preferences and application settings"
          actions={
            <Button 
              type="submit" 
              form="settings-form"
              disabled={isLoading || !formState.isDirty}
            >
              {isLoading ? (
                <>
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          }
        />

        <form id="settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: App Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>
                Customize how ShopAI Insight looks and functions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Interface Theme</Label>
                {/* TODO: Connect this setting to the Supabase backend via a preferences API. */}
                <div>
                  <ModeToggle />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeRange">Default Chart Time Range</Label>
                {/* TODO: Connect this setting to the Supabase backend via a preferences API. */}
                <Select defaultValue="30">
                  <SelectTrigger id="timeRange">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                {/* TODO: Connect this setting to the Supabase backend via a preferences API. */}
                <Checkbox id="allowStaffAccess" defaultChecked={true} />
                <Label htmlFor="allowStaffAccess">
                  Allow staff users to access AI Assistant
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: AI Assistant Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Configuration</CardTitle>
              <CardDescription>
                Customize how the AI responds to your queries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="responseTone">Response Tone</Label>
                {/* TODO: Connect this setting to the Supabase backend via a preferences API. */}
                <Select defaultValue="neutral">
                  <SelectTrigger id="responseTone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Response Length</Label>
                {/* TODO: Connect this setting to the Supabase backend via a preferences API. */}
                <div className="space-y-1">
                  <Slider 
                    value={responseLength} 
                    onValueChange={setResponseLength} 
                    max={100} 
                    step={1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Short</span>
                    <span>Detailed</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeGoal">Default Store Goal</Label>
                {/* TODO: Connect this setting to the Supabase backend via a preferences API. */}
                <Input 
                  id="storeGoal" 
                  defaultValue="Increase repeat customer revenue by 15%" 
                  placeholder="e.g., increase repeat customer revenue" 
                />
                <p className="text-xs text-muted-foreground">
                  This goal helps the AI provide more relevant insights
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Data Sync Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Data Sync Preferences</CardTitle>
              <CardDescription>
                Control how and when store data is synchronized
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="syncInterval">Auto-sync Interval</Label>
                {/* TODO: Connect this setting to the Supabase backend via a preferences API. */}
                <Select defaultValue="daily">
                  <SelectTrigger id="syncInterval">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleManualSync} 
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RotateCw className="mr-2 h-4 w-4" />
                      Run Manual Sync
                    </>
                  )}
                </Button>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  {/* TODO: Replace with actual last sync time from API */}
                  Last synced 2h ago
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: GDPR & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>GDPR & Privacy</CardTitle>
              <CardDescription>
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete all AI chat history
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                      This will permanently delete all AI chat history for your store. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setConfirmDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteHistory}
                    >
                      Yes, Delete Everything
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="flex items-center space-x-2">
                {/* TODO: Connect this setting to the Supabase backend via a preferences API. */}
                <Switch id="optOutAnalytics" />
                <Label htmlFor="optOutAnalytics">
                  Opt out of usage analytics
                </Label>
              </div>

              <div className="rounded-md bg-muted p-4 text-sm">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <p>We comply with GDPR, CCPA, and Shopify's privacy terms.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Subscription & Billing */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Billing</CardTitle>
              <CardDescription>
                Manage your subscription plan and billing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Plan</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="default" className="bg-primary">Pro</Badge>
                    <span className="text-sm text-muted-foreground">$29/month</span>
                  </div>
                </div>
                <Button variant="outline">
                  {/* TODO: Connect to billing management API or service */}
                  Manage Subscription
                </Button>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                Invoices are handled via Lemon Squeezy. For billing inquiries, please contact support.
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
