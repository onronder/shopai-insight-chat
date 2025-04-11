
import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ThemeProvider } from "./ThemeProvider";

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout wrapper for all pages in the application
 * Provides consistent structure with header, sidebar and content area
 */
export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden bg-background dark:bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};
