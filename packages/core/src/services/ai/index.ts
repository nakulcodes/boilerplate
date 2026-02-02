import { ConfigService } from '@nestjs/config';
import { AiService, OpenAiService, GeminiAiService } from './ai.service';

function getAiServiceClass(provider: string | undefined) {
  const normalizedProvider = provider?.toUpperCase();
  switch (normalizedProvider) {
    case 'OPENAI':
      return OpenAiService;
    case 'GEMINI':
      return GeminiAiService;
    default:
      return OpenAiService; // Default to OpenAI
  }
}

export const aiService = {
  provide: AiService,
  useFactory: (configService: ConfigService) => {
    const aiProvider = configService.get<string>('AI_PROVIDER');
    const AiClass = getAiServiceClass(aiProvider);
    return new AiClass();
  },
  inject: [ConfigService],
};

export { AiService };
