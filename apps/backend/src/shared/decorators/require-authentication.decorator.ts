import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

/**
 * Convenience decorator that combines JWT authentication guard and Swagger bearer auth
 * Use this on any route that requires authentication
 */
export const RequireAuthentication = () => {
  return applyDecorators(UseGuards(JwtAuthGuard), ApiBearerAuth());
};
