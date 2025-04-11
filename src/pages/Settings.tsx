
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Check, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useStoreData } from "@/hooks/useStoreData";

// Import the new component files
import AppPreferences from "@/components/settings/AppPreferences";
import AIAssistantSettings from "@/components/settings/AIAssistantSettings";
import DataSyncSettings from "@/components/settings/DataSyncSettings";
import PrivacySettings from "@/components/settings/PrivacySettings";
import SubscriptionSettings from "@/components/settings/SubscriptionSettings";

const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
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

  if (pageLoading) {
    return (
      <AppLayout>
        <PageHeader 
          title="Settings" 
          description="Manage your store preferences and application settings"
        />
        <div className="container max-w-4xl pb-20">
          <LoadingState message="Loading your preferences..." />
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
          <AppPreferences />
          <AIAssistantSettings />
          <DataSyncSettings />
          <PrivacySettings />
          <SubscriptionSettings />
        </form>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
