// File: src/pages/SettingsPage.tsx

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import AppPreferences from '@/components/settings/AppPreferences';
import AIAssistantSettings from '@/components/settings/AIAssistantSettings';
import DataSyncSettings from '@/components/settings/DataSyncSettings';
import PrivacySettings from '@/components/settings/PrivacySettings';
import { SubscriptionSettings } from '@/components/settings/SubscriptionSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Settings as SettingsIcon, Bot, Database, Shield, CreditCard } from 'lucide-react';
import { useStoreAccessGuard } from '@/hooks/useStoreAccessGuard';
import { secureFetch } from '@/lib/secure-fetch';
import { PlanGate } from '@/components/auth/PlanGate';
import { Link } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  useStoreAccessGuard();

  const { isLoading, isError } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const res = await secureFetch('/rest/v1/user_preferences');
      if (!res.ok) throw new Error('Failed to fetch user preferences');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 container mx-auto max-w-5xl py-8">
          <Skeleton className="h-12 w-3/4 md:w-1/2" />
          <Skeleton className="h-[600px] rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

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
    <PlanGate required="basic">
      <AppLayout>
        <div className="container mx-auto max-w-5xl py-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Settings</h1>
          <p className="text-muted-foreground mb-6">Manage your account and application preferences</p>

          <Card className="rounded-2xl shadow-md">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid grid-cols-5 m-6 rounded-lg">
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" /> Account
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" /> AI Assistant
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <Database className="h-4 w-4" /> Data Sync
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Privacy
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Subscription
                </TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="px-6 pb-6">
                <AppPreferences />
              </TabsContent>

              <TabsContent value="ai" className="px-6 pb-6">
                <AIAssistantSettings />
              </TabsContent>

              <TabsContent value="data" className="px-6 pb-6">
                <DataSyncSettings />
              </TabsContent>

              <TabsContent value="privacy" className="px-6 pb-6">
                <PrivacySettings />
                <div className="text-xs text-muted-foreground mt-8 text-center">
                  View our <Link to="/privacy" className="hover:underline">Privacy Policy</Link> · <Link to="/terms" className="hover:underline">Terms of Use</Link>
                </div>
              </TabsContent>

              <TabsContent value="subscription" className="px-6 pb-6">
                <SubscriptionSettings />
                <div className="text-xs text-muted-foreground mt-8 text-center">
                  Read our <Link to="/terms" className="hover:underline">Terms of Use</Link> and <Link to="/privacy" className="hover:underline">Privacy Policy</Link>.
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </AppLayout>
    </PlanGate>
  );
};

export default SettingsPage;