import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
	constructor(private configService: ConfigService) {}

	use(req: Request, res: Response, next: NextFunction) {
		const apiKey = this.configService.get<string>('API_KEY');
		const reqApiKey = req.header('X-API-KEY');
		if (reqApiKey != apiKey) {
			return res.status(400).send(['No valid api-key provided']);
		}
		next();
	}
}
