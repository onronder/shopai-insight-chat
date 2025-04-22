import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { ModeToggle } from "./ModeToggle";
import { Button } from "@/components/ui/button";
import { Settings, User, HelpCircle, LogOut, Store } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useStoreSyncStatus } from "@/hooks/useStoreSyncStatus";
import { supabase } from "@/integrations/supabase/client";

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { storeDomain } = useStoreSyncStatus();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/analytics")) return "Analytics Overview";
    if (path.includes("/customers")) return "Customer Intelligence";
    if (path.includes("/orders")) return "Orders & Fulfillment";
    if (path.includes("/products")) return "Product Performance";
    if (path.includes("/assistant")) return "AI Assistant 🤖";
    if (path.includes("/settings")) return "Settings";
    if (path.includes("/help")) return "Help & Support";
    return "Dashboard";
  };

  const handleDisconnectStore = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        toast({
          title: "Unauthorized",
          description: "No valid session token found.",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch("/functions/v1/disconnect_store", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast({
          title: "Error disconnecting store",
          description: body?.error || "Unexpected error occurred.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Store disconnected",
        description: "Your store has been successfully disconnected.",
      });

      navigate("/login");
    } catch (error) {
      toast({
        title: "Unexpected error",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <h1 className="text-xl font-semibold tracking-tight">{getPageTitle()}</h1>

      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {storeDomain ? (
            <span className="font-medium text-foreground">{storeDomain}</span>
          ) : (
            <span className="italic text-muted-foreground">Loading store...</span>
          )}
        </div>

        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">Account menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/help" className="flex items-center cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDisconnectStore}
              className="text-red-500 focus:text-red-500"
            >
              <Store className="mr-2 h-4 w-4" />
              <span>Disconnect Store</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
