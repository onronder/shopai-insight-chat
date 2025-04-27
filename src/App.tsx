// File: src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import ShopifyLogin from "@/pages/ShopifyLogin";
import AuthPage from "@/pages/Auth";
import Welcome from "@/pages/Welcome";
import NotFound from "@/pages/NotFound";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import { useEffect, useState } from "react";
import { bootstrapAuthFromCookie, supabase } from "@/lib/initAuth";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      await bootstrapAuthFromCookie();
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data?.session);
    };

    checkSession();
  }, []);

  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/shopify-login" element={!isAuthenticated ? <ShopifyLogin /> : <Navigate to="/welcome" />} />
            <Route path="/welcome" element={isAuthenticated ? <Welcome /> : <Navigate to="/shopify-login" />} />
            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/shopify-login" />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
