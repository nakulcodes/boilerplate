import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  aiService,
  cacheManagerProvider,
  redisCacheService,
} from '@boilerplate/core';

// Interceptors & Middleware
import { ResponseInterceptor } from './framework/response.interceptor';
import { AuditInterceptor } from './framework/audit.interceptor';
import { RequestIdMiddleware } from './middleware/request-id.middleware';

// Filters
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { PermissionsGuard } from './decorators/require-permissions.decorator';

// Services
import { SupabaseAdminService } from './services/supabase-admin.service';

const SHARED_PROVIDERS = [
  aiService,
  cacheManagerProvider,
  redisCacheService,
  ResponseInterceptor,
  AuditInterceptor,
  RequestIdMiddleware,
  GlobalExceptionFilter,
  PermissionsGuard,
  SupabaseAdminService,
];

@Global()
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const jwtSecret = configService.get<string>('SUPABASE_JWT_SECRET');
        if (!jwtSecret) {
          throw new Error(
            'SUPABASE_JWT_SECRET is not defined in environment variables',
          );
        }
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: '1h',
          },
        };
      },
    }),
  ],
  providers: [...SHARED_PROVIDERS],
  exports: [...SHARED_PROVIDERS, JwtModule],
})
export class SharedModule {}
