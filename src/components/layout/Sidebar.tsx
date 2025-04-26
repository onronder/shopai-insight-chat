// File: src/components/layout/sidebar.tsx

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Home,
  Users,
  ShoppingCart,
  Package,
  Bot,
  Settings,
  HelpCircle,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useBillingInfo } from "@/hooks/useBillingInfo";
import { Skeleton } from "@/components/ui/skeleton";

export const Sidebar: React.FC = () => {
  const { data: billingInfo, isLoading: billingLoading } = useBillingInfo();
  const navigate = useNavigate();

  const isTrialActive = billingInfo?.trial_ends_at && new Date(billingInfo.trial_ends_at) > new Date();
  const isSubscriptionActive = billingInfo?.subscription_status === "active";

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
            S
          </div>
          <h1 className="font-bold text-lg">ShopAI Insight</h1>
        </div>

        <nav className="space-y-2">
          <NavItem href="/" icon={Home} label="Dashboard" />
          <NavItem href="/analytics" icon={BarChart3} label="Analytics" />
          <NavItem href="/customers" icon={Users} label="Customers" />
          <NavItem href="/orders" icon={ShoppingCart} label="Orders" />
          <NavItem href="/products" icon={Package} label="Products" />
          <NavItem href="/store" icon={ShieldCheck} label="Store Intelligence" />
          <NavItem href="/assistant" icon={Bot} label="AI Assistant" />
        </nav>

        {/* Billing Management Section */}
        <div className="mt-8">
          {billingLoading ? (
            <Skeleton className="h-10 w-full rounded-md" />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start mt-4"
              onClick={() => navigate("/settings/billing")}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isSubscriptionActive || isTrialActive ? "Manage Subscription" : "Choose a Plan"}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-auto p-4">
        <Separator className="mb-4" />
        <NavItem href="/settings" icon={Settings} label="Settings" />
        <NavItem href="/help" icon={HelpCircle} label="Help & Support" />
      </div>
    </aside>
  );
};

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label }) => {
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )
      }
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  );
};
