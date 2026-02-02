import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithReqId extends Request {
  _reqId: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithReqId, res: Response, next: NextFunction) {
    // Generate unique request ID
    req._reqId = `req_${uuidv4().replace(/-/g, '')}`;

    // Add request ID to response headers for client-side tracing
    res.setHeader('X-Request-ID', req._reqId);

    next();
  }
}
