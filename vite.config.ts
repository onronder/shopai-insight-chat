import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    sourcemap: true, // required for Sentry source map upload
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" &&
      sentryVitePlugin({
        org: "fittechs",
        project: "shopai_insight",
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: process.env.VITE_SENTRY_RELEASE, // ✅ reference as an env variable
        include: "./dist",
        url: "https://sentry.io",
        setCommits: {
          auto: true,
        },
        deploy: {
          env: process.env.NODE_ENV || "production",
        },
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
