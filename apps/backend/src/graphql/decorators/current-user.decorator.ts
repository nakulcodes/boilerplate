import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserSessionData } from '../../modules/shared/decorators/user-session.decorator';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserSessionData => {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();

    if (req.user) {
      return req.user;
    }

    Logger.error(
      'Attempted to access user session without a user in the request. Did you forget to add GqlAuthGuard?',
      'CurrentUser',
    );
    throw new InternalServerErrorException('User session not available');
  },
);
