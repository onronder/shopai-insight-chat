
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import AnalyticsPage from "./pages/Analytics";
import CustomersPage from "./pages/Customers";
import OrdersPage from "./pages/Orders";
import ProductsPage from "./pages/Products";
import AssistantPage from "./pages/Assistant";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/analytics" element={<AppLayout><AnalyticsPage /></AppLayout>} />
          <Route path="/customers" element={<AppLayout><CustomersPage /></AppLayout>} />
          <Route path="/orders" element={<AppLayout><OrdersPage /></AppLayout>} />
          <Route path="/products" element={<AppLayout><ProductsPage /></AppLayout>} />
          <Route path="/assistant" element={<AppLayout><AssistantPage /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
