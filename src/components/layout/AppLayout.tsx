import React, { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { SyncStatusBanner } from "../common/SyncStatusBanner";
import { BillingReminderBanner } from "../billing/BillingReminderBanner";
import { Link } from "react-router-dom";
import { initializeShopifyAppBridge } from "@/lib/shopify-app-bridge"; // ✅ ADD THIS

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout wrapper for all pages in the application
 * Provides consistent structure with header, sidebar, and content area
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  useEffect(() => {
    initializeShopifyAppBridge(); // ✅ Initialize when layout mounts
  }, []);

  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-background dark:bg-background font-sans">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <SyncStatusBanner />
            <BillingReminderBanner />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
        <footer className="text-center text-xs text-muted-foreground py-4 border-t">
          © 2025 ShopAI Insight.{' '}
          <Link to="/privacy" className="hover:underline">
            Privacy Policy
          </Link>{' '}·{' '}
          <Link to="/terms" className="hover:underline">
            Terms of Use
          </Link>
        </footer>
        <Toaster />
      </div>
    </ThemeProvider>
  );
};
