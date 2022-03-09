import { NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
export declare class ApiKeyMiddleware implements NestMiddleware {
    private configService;
    constructor(configService: ConfigService);
    use(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>>;
}
