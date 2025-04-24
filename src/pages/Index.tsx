// File: src/pages/Index.tsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bootstrapAuthFromCookie } from "@/lib/initAuth";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    // Just cleanup token from URL if present (you could store it in a cookie if needed)
    if (token) {
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.pathname);
    }

    // Always try bootstrapping from cookie
    bootstrapAuthFromCookie().finally(() => {
      navigate("/dashboard");
    });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <h1>Redirecting to dashboard...</h1>
    </div>
  );
};

export default HomePage;
