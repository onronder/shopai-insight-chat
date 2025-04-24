// File: vite.config.ts
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
    sourcemap: true,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" &&
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN!,
        org: "fittechs",
        project: "shopai_insight",
        telemetry: false, // Optional: disable telemetry
        sourcemaps: {
          assets: "./dist/**", // Use this instead of include
        },
        release: {
          name: process.env.VITE_SENTRY_RELEASE || "shopai-insight-release",
          setCommits: {
            auto: true,
          },
          deploy: {
            env: process.env.NODE_ENV || "production",
          },
        },
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));