
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ModeToggle } from "./ModeToggle";
import { Button } from "@/components/ui/button";
import { Settings, User, HelpCircle, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    if (path.includes("/settings")) return "Settings";
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help & Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Link to="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </Link>
      </div>
    </header>
  );
};
