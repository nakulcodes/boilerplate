import { Request } from 'express';
import { UserSessionData } from '../modules/shared/decorators/user-session.decorator';

export interface GqlContext {
  req: Request & { user?: UserSessionData };
}
