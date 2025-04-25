// File: src/lib/sentry.ts

import * as Sentry from "@sentry/react";
// Try importing from the core browser package
import { browserTracingIntegration } from "@sentry/browser";

/**
 * Initializes Sentry for client-side error monitoring
 */
export function initSentry() {
  Sentry.init({
    dsn: "https://855381ba9241f6fbed2de2e368d5ae75@o4508223588663296.ingest.de.sentry.io/4509152634077264",
    integrations: [
      browserTracingIntegration(),
      // Remove console integration for now
    ],
    tracesSampleRate: 0.2,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || "unknown",

    // ✅ Ignore noisy network errors
    beforeSend(event) {
      const value = event?.exception?.values?.[0]?.value;
      if (value?.includes("AbortError") || value?.includes("Request failed")) {
        return null;
      }
      return event;
    },
  });

  // Set global tags
  Sentry.setTag("platform", "web");
  Sentry.setTag("build", import.meta.env.MODE);
}

/**
 * Captures and logs an error to Sentry with optional context
 */
export function logError(
  error: Error,
  context?: Record<string, unknown>
) {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}