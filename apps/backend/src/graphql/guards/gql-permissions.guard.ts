import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PERMISSIONS_KEY } from '../../modules/shared/decorators/require-permissions.decorator';

@Injectable()
export class GqlPermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (nodeEnv === 'development') {
      if (requiredPermissions && requiredPermissions.length > 0) {
        console.warn(
          `[DEV MODE] Permission check bypassed for: [${requiredPermissions.join(', ')}]`,
        );
      }
      return true;
    }

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    if (!user?.permissions?.length) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const hasPermission = requiredPermissions.every((required) =>
      user.permissions.some(
        (p: string) => p === required || p.startsWith(required + ':'),
      ),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
