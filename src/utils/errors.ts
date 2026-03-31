/** Custom error class for Listing Bureau API errors. */
export class LBApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "LBApiError";
  }
}

/** Format an LBApiError (or unknown error) into a human-readable string. */
export function formatError(error: unknown): string {
  if (error instanceof LBApiError) {
    return `API Error [${error.code}] (${error.statusCode}): ${error.message}`;
  }
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  return `Unknown error: ${String(error)}`;
}
