// File: src/App.tsx
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
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
import { bootstrapAuthFromCookie, supabase } from "@/lib/initAuth";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  useEffect(() => {
    async function checkAuth() {
      await bootstrapAuthFromCookie();
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      // Check if user has completed onboarding (welcome screen)
      if (data.session) {
        // You can either use local storage or better check from Supabase if user has completed onboarding
        const onboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';
        setHasCompletedOnboarding(onboardingCompleted);
      }
    }
    
    checkAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/shopify-login" element={isAuthenticated ? <Navigate to="/welcome" /> : <ShopifyLogin />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            
            {/* Routes that require authentication */}
            <Route path="/welcome" element={
              isAuthenticated ? <Welcome /> : <Navigate to="/shopify-login" />
            } />
            
            {/* Protected routes that require authentication AND completed onboarding */}
            <Route path="/" element={
              isAuthenticated 
                ? hasCompletedOnboarding
                  ? <Dashboard /> 
                  : <Navigate to="/welcome" />
                : <Navigate to="/shopify-login" />
            } />
            <Route path="/analytics" element={
              isAuthenticated && hasCompletedOnboarding ? <AnalyticsPage /> : <Navigate to="/shopify-login" />
            } />
            <Route path="/customers" element={
              isAuthenticated && hasCompletedOnboarding ? <CustomersPage /> : <Navigate to="/shopify-login" />
            } />
            <Route path="/orders" element={
              isAuthenticated && hasCompletedOnboarding ? <OrdersPage /> : <Navigate to="/shopify-login" />
            } />
            <Route path="/products" element={
              isAuthenticated && hasCompletedOnboarding ? <ProductsPage /> : <Navigate to="/shopify-login" />
            } />
            <Route path="/assistant" element={
              isAuthenticated && hasCompletedOnboarding ? <AssistantPage /> : <Navigate to="/shopify-login" />
            } />
            <Route path="/settings" element={
              isAuthenticated && hasCompletedOnboarding ? <SettingsPage /> : <Navigate to="/shopify-login" />
            } />
            <Route path="/help" element={
              isAuthenticated && hasCompletedOnboarding ? <HelpPage /> : <Navigate to="/shopify-login" />
            } />
            <Route path="/store" element={
              isAuthenticated && hasCompletedOnboarding ? <Store /> : <Navigate to="/shopify-login" />
            } />
            
            {/* Fallback for unknown routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;