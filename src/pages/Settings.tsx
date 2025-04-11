
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import AppPreferences from '@/components/settings/AppPreferences';
import AIAssistantSettings from '@/components/settings/AIAssistantSettings';
import DataSyncSettings from '@/components/settings/DataSyncSettings';
import PrivacySettings from '@/components/settings/PrivacySettings';
import SubscriptionSettings from '@/components/settings/SubscriptionSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useQuery } from '@tanstack/react-query';

const SettingsPage: React.FC = () => {
  // Query to fetch user preferences - mock for now
  const { data: preferences, isLoading, isError } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      // Mock API call - would connect to Supabase in production
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ loaded: true });
        }, 1000);
      });
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4 md:w-1/2" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[350px]" />
            <Skeleton className="h-[350px]" />
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      <AppLayout>
        <EmptyState
          title="Could not load settings"
          description="We encountered an error while trying to load your preferences."
          actionLabel="Try again"
          onAction={() => window.location.reload()}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <AppPreferences />
          <AIAssistantSettings />
          <DataSyncSettings />
          <PrivacySettings />
          <SubscriptionSettings />
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
