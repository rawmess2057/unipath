import { z } from 'zod';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callWithRetry<T>(
  fn: () => Promise<T>,
  schema: z.ZodSchema<T>,
  maxRetries = 2,
): Promise<T> {
  let lastError: string | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return schema.parse(result);
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt === maxRetries) break;
      await sleep(1000 * Math.pow(2, attempt));
    }
  }

  throw new Error(`Operation failed after ${maxRetries} retries: ${lastError}`);
}
