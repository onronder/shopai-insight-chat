// File: src/lib/logging.ts

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

  console.error(`[ERROR][${context}]`, errorMessage, { ...metadata, stackTrace });
}
