// File: supabase/functions/_shared/logging.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/dotenv/load.ts";

const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

export function logInfo(
  context: string,
  message: string,
  metadata: Record<string, unknown> = {}
) {
  console.info(`[INFO][${context}]`, message, metadata);
}

export function logError(
  context: string,
  error: unknown,
  metadata: Record<string, unknown> = {}
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stackTrace = error instanceof Error ? error.stack : null;

  console.error(`[ERROR][${context}]`, errorMessage, metadata);

  supabase.from("error_logs").insert({
    context,
    error_message: errorMessage,
    stack_trace: stackTrace,
    metadata
  }).then().catch((err) => {
    console.error("[FATAL] Failed to write to error_logs:", err);
  });
}
