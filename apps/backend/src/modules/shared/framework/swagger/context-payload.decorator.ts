import { ApiPropertyOptions } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export function ApiContextPayload(_overrides?: Partial<ApiPropertyOptions>) {
  // return applyDecorators(
  //   ApiPropertyOptional({
  //     ...CONTEXT_PAYLOAD_SWAGGER_OPTIONS,
  //     ...overrides,
  //   })
  // );
}
