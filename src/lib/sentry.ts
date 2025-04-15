// File: src/lib/sentry.ts

import * as Sentry from "@sentry/react";
import { browserTracingIntegration } from "@sentry/react";

export function initSentry() {
  Sentry.init({
    dsn: "https://855381ba9241f6fbed2de2e368d5ae75@o4508223588663296.ingest.de.sentry.io/4509152634077264",
    integrations: [
      browserTracingIntegration(),
    ],
    tracesSampleRate: 0.2,
    environment: import.meta.env.MODE,
  });
}

export function logError(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.withScope(scope => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}
