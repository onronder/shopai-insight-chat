
import React from "react";
import { useLocation } from "react-router-dom";
import { ModeToggle } from "./ModeToggle";
import { Button } from "@/components/ui/button";
import { Settings, User } from "lucide-react";

export const Header: React.FC = () => {
  const location = useLocation();
  
  // Function to get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/analytics")) return "Analytics Overview";
    if (path.includes("/customers")) return "Customer Intelligence";
    if (path.includes("/orders")) return "Orders & Fulfillment";
    if (path.includes("/products")) return "Product Performance";
    if (path.includes("/assistant")) return "AI Assistant 🤖";
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <h1 className="text-xl font-semibold tracking-tight">{getPageTitle()}</h1>
      
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">mydemostore</span>.myshopify.com
        </div>
        <ModeToggle />
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
          <span className="sr-only">Profile</span>
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </div>
    </header>
  );
};
