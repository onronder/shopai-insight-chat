// File: supabase/functions/_shared/logging.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

// ✅ Environment-based Supabase client initialization
const supabase = createClient(
  Deno.env.get("PROJECT_SUPABASE_URL")!,
  Deno.env.get("PROJECT_SERVICE_ROLE_KEY")!
);

/**
 * Logs a non-fatal event to the console (info level).
 */
export function logInfo(
  context: string,
  message: string,
  metadata: Record<string, unknown> = {}
) {
  console.info(`[INFO][${context}]`, message, metadata);
}

/**
 * Logs a fatal error to the console and persists it to the Supabase `error_logs` table.
 */
export async function logError(
  context: string,
  error: unknown,
  metadata: Record<string, unknown> = {}
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stackTrace = error instanceof Error ? error.stack : null;

  console.error(`[ERROR][${context}]`, errorMessage, metadata);

  const { error: insertError } = await supabase.from("error_logs").insert({
    context,
    error_message: errorMessage,
    stack_trace: stackTrace,
    metadata
  });

  if (insertError) {
    console.error("[FATAL] Failed to write to error_logs:", insertError.message);
  }
}
