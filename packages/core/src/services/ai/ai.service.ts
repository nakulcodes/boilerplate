import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

export interface GenerateTextOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateTextResponse {
  content: string;
  success: boolean;
}

export abstract class AiService {
  abstract generateText(options: GenerateTextOptions): Promise<GenerateTextResponse>;
}

export class OpenAiService implements AiService {
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async generateText(options: GenerateTextOptions): Promise<GenerateTextResponse> {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

      if (options.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt,
        });
      }

      messages.push({
        role: 'user',
        content: options.prompt,
      });

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content generated from OpenAI');
      }

      return {
        content,
        success: true,
      };
    } catch (error: any) {
      throw new Error(`Failed to generate text via OpenAI: ${error.message}`);
    }
  }
}

export class GeminiAiService implements AiService {
  private client: GoogleGenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    this.client = new GoogleGenAI({ apiKey });
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  async generateText(options: GenerateTextOptions): Promise<GenerateTextResponse> {
    try {
      const result = await this.client.models.generateContent({
        model: this.model,
        contents: options.prompt,
        config: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 2000,
          ...(options.systemPrompt && {
            systemInstruction: options.systemPrompt,
          }),
        },
      });

      const content = result.text;

      if (!content) {
        throw new Error('No content generated from Gemini');
      }

      return {
        content,
        success: true,
      };
    } catch (error: any) {
      throw new Error(`Failed to generate text via Gemini: ${error.message}`);
    }
  }
}
