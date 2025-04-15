import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Home,
  Users,
  ShoppingCart,
  Package,
  Bot,
  Settings,
  HelpCircle,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const Sidebar: React.FC = () => {
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