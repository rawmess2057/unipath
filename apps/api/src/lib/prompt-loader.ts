import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = resolve(__dirname, '../../../../prompts/versions');

export interface PromptPair {
  system: string;
  user: string;
}

export function loadPrompt(feature: string, version: string): PromptPair {
  const basePath = resolve(PROMPTS_DIR, feature);

  const systemPath = resolve(basePath, `${version}.system.md`);
  const userPath = resolve(basePath, `${version}.user.md`);

  const system = readFileSync(systemPath, 'utf-8');
  const user = readFileSync(userPath, 'utf-8');

  return { system, user };
}

export function interpolate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}
