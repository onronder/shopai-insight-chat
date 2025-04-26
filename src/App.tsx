// File: src/App.tsx

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/Dashboard";
import AnalyticsPage from "./pages/Analytics";
import CustomersPage from "./pages/Customers";
import OrdersPage from "./pages/Orders";
import ProductsPage from "./pages/Products";
import AssistantPage from "./pages/Assistant";
import SettingsPage from "./pages/Settings";
import HelpPage from "./pages/Help";
import Welcome from "./pages/Welcome";
import NotFound from "./pages/NotFound";
import ShopifyLogin from "./pages/ShopifyLogin";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Store from "./pages/Store";
import Auth from "./pages/Auth"; // ✅ New auth page

import { bootstrapAuthFromCookie, supabase } from "@/lib/initAuth";
import { initializeShopifyAppBridge } from "@/lib/shopify-app-bridge";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      await bootstrapAuthFromCookie();
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      setIsAuthenticated(!!session);

      if (session) {
        const onboardingCompleted = localStorage.getItem("onboardingCompleted") === "true";
        setHasCompletedOnboarding(onboardingCompleted);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // ✅ Initialize Shopify App Bridge ONLY on embedded pages
  useEffect(() => {
    const embeddedPages = [
      "/", "/welcome", "/dashboard", "/analytics", "/customers", "/orders",
      "/products", "/assistant", "/settings", "/store", "/help"
    ];

    if (embeddedPages.some((page) => location.pathname.startsWith(page))) {
      initializeShopifyAppBridge();
    }
  }, [location.pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/shopify-login" element={isAuthenticated ? <Navigate to="/welcome" /> : <ShopifyLogin />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/auth" element={<Auth />} /> {/* ✅ Shopify OAuth auto re-auth */}

      {/* Welcome onboarding */}
      <Route path="/welcome" element={isAuthenticated ? <Welcome /> : <Navigate to="/shopify-login" />} />

      {/* Authenticated + Onboarded */}
      <Route path="/" element={isAuthenticated
        ? hasCompletedOnboarding
          ? <Dashboard />
          : <Navigate to="/welcome" />
        : <Navigate to="/shopify-login" />} />
      <Route path="/analytics" element={isAuthenticated && hasCompletedOnboarding ? <AnalyticsPage /> : <Navigate to="/shopify-login" />} />
      <Route path="/customers" element={isAuthenticated && hasCompletedOnboarding ? <CustomersPage /> : <Navigate to="/shopify-login" />} />
      <Route path="/orders" element={isAuthenticated && hasCompletedOnboarding ? <OrdersPage /> : <Navigate to="/shopify-login" />} />
      <Route path="/products" element={isAuthenticated && hasCompletedOnboarding ? <ProductsPage /> : <Navigate to="/shopify-login" />} />
      <Route path="/assistant" element={isAuthenticated && hasCompletedOnboarding ? <AssistantPage /> : <Navigate to="/shopify-login" />} />
      <Route path="/settings" element={isAuthenticated && hasCompletedOnboarding ? <SettingsPage /> : <Navigate to="/shopify-login" />} />
      <Route path="/help" element={isAuthenticated && hasCompletedOnboarding ? <HelpPage /> : <Navigate to="/shopify-login" />} />
      <Route path="/store" element={isAuthenticated && hasCompletedOnboarding ? <Store /> : <Navigate to="/shopify-login" />} />

      {/* 404 fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
