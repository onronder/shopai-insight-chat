
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SalesChart } from "@/components/charts/SalesChart";
import { ProductsChart } from "@/components/charts/ProductsChart";
import { CustomerChart } from "@/components/charts/CustomerChart";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp,
  ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/chat/ChatInterface";

const Dashboard: React.FC = () => {
  return (
    <AppLayout>
      <div className="flex h-full">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <Button variant="ghost" className="flex items-center">
                View detailed reports <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatsCard 
                title="Total Revenue" 
                value="$24,568" 
                change={{ value: 12.5, timeframe: "last month" }}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <StatsCard 
                title="Orders" 
                value="342" 
                change={{ value: 8.2, timeframe: "last month" }}
                icon={<ShoppingBag className="h-4 w-4" />}
              />
              <StatsCard 
                title="Customers" 
                value="1,254" 
                change={{ value: 5.7, timeframe: "last month" }}
                icon={<Users className="h-4 w-4" />}
              />
              <StatsCard 
                title="Conversion Rate" 
                value="2.8%" 
                change={{ value: 0.4, timeframe: "last month" }}
                icon={<TrendingUp className="h-4 w-4" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <SalesChart variant="area" />
              <ProductsChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CustomerChart />
              <SalesChart title="Monthly Sales Trend" />
            </div>
          </div>
        </div>

        <div className="w-[450px] border-l flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Ask ShopAI</h2>
            <Button variant="outline" size="sm">
              Clear chat
            </Button>
          </div>
          <ChatInterface />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
