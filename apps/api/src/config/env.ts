import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().default('postgresql://unipath:unipath@localhost:5432/unipath'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  UPLOAD_DIR: z.string().default('./uploads'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.warn('Environment validation warnings:', result.error.flatten().fieldErrors);
    return envSchema.parse({
      PORT: 4000,
      DATABASE_URL: 'postgresql://unipath:unipath@localhost:5432/unipath',
      REDIS_URL: 'redis://localhost:6379',
      UPLOAD_DIR: './uploads',
      NODE_ENV: 'development',
    });
  }
  return result.data;
}

export const env = loadEnv();
