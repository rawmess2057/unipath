import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { env } from '../config/env.js';

export interface AiProvider {
  analyzeCv<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T>;
  generateRoadmap<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T>;
}

export class ClaudeProvider implements AiProvider {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY || '',
    });
  }

  async analyzeCv<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20260514',
      max_tokens: 4096,
      temperature: 0.2,
      tools: [
        {
          name: 'cv_analysis',
          description: 'Analyze a CV and return structured feedback with quality score',
          input_schema: zodToJsonSchema(schema) as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: 'tool', name: 'cv_analysis' },
      messages: [{ role: 'user', content: prompt }],
    });

    const toolBlock = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    );

    if (!toolBlock) {
      throw new Error('No tool_use block in response');
    }

    return schema.parse(toolBlock.input);
  }

  async generateRoadmap<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20260514',
      max_tokens: 2048,
      temperature: 0.3,
      tools: [
        {
          name: 'generate_roadmap',
          description: 'Generate a personalized employability roadmap',
          input_schema: zodToJsonSchema(schema) as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: 'tool', name: 'generate_roadmap' },
      messages: [{ role: 'user', content: prompt }],
    });

    const toolBlock = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    );

    if (!toolBlock) {
      throw new Error('No tool_use block in response');
    }

    return schema.parse(toolBlock.input);
  }
}

export function getAiProvider(): AiProvider {
  return new ClaudeProvider();
}
