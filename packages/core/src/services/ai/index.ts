import { ConfigService } from '@nestjs/config';
import { AiService, OpenAiService, GeminiAiService, NoOpAiService } from './ai.service';

function getAiServiceClass(
  provider: string | undefined,
  configService: ConfigService
): new () => AiService {
  const normalizedProvider = provider?.toUpperCase();

  // Check for API keys
  const openAiKey = configService.get<string>('OPENAI_API_KEY');
  const geminiKey = configService.get<string>('GEMINI_API_KEY');

  switch (normalizedProvider) {
    case 'OPENAI':
      if (!openAiKey) {
        console.warn('AI_PROVIDER is set to OPENAI but OPENAI_API_KEY is not configured. AI features will be disabled.');
        return NoOpAiService;
      }
      return OpenAiService;
    case 'GEMINI':
      if (!geminiKey) {
        console.warn('AI_PROVIDER is set to GEMINI but GEMINI_API_KEY is not configured. AI features will be disabled.');
        return NoOpAiService;
      }
      return GeminiAiService;
    default:
      // No provider specified, try to use OpenAI if key exists, otherwise use NoOp
      if (openAiKey) {
        return OpenAiService;
      }
      if (geminiKey) {
        return GeminiAiService;
      }
      console.warn('No AI provider configured or API keys missing. AI features will be disabled.');
      return NoOpAiService;
  }
}

export const aiService = {
  provide: AiService,
  useFactory: (configService: ConfigService) => {
    const aiProvider = configService.get<string>('AI_PROVIDER');
    const AiClass = getAiServiceClass(aiProvider, configService);
    return new AiClass();
  },
  inject: [ConfigService],
};

export { AiService };
