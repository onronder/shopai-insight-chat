
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Home, 
  Users, 
  ShoppingCart, 
  Settings, 
  HelpCircle,
  Package
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-sidebar border-r border-border flex flex-col h-full">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-md bg-shopify-primary flex items-center justify-center text-white font-bold">
            S
          </div>
          <h1 className="font-bold text-lg">ShopAI Insight</h1>
        </div>

        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/customers">
              <Users className="mr-2 h-4 w-4" />
              Customers
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/orders">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Orders
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <a href="/products">
              <Package className="mr-2 h-4 w-4" />
              Products
            </a>
          </Button>
        </nav>
      </div>
      
      <div className="mt-auto p-4">
        <Separator className="mb-4" />
        <Button variant="ghost" className="w-full justify-start" asChild>
          <a href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </a>
        </Button>
        <Button variant="ghost" className="w-full justify-start" asChild>
          <a href="/help">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </a>
        </Button>
      </div>
    </aside>
  );
};
