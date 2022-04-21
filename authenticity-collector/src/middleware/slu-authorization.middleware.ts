import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SluAuthorizationMiddleware implements NestMiddleware {
	constructor(private configService: ConfigService, private httpService: HttpService) {}

	async use(req: any, res: any, next: () => void) {
		const { authorization } = req.headers;

		if (!authorization || !authorization.startsWith('Bearer')) {
			return res.status(HttpStatus.UNAUTHORIZED).send({ error: 'not authenticated' });
		}

		const split = authorization.split('Bearer ');
		if (split.length !== 2) {
			return res.status(HttpStatus.UNAUTHORIZED).send({ error: 'not authenticated!' });
		}

		const token = split[1];
	
		const is_url = this.configService.get('IS_API_URL');
		const { data } = await firstValueFrom(this.httpService.post(`${is_url}/authentication/verify-jwt`, {jwt: token}));

		if(!data.isValid){
			return res.status(HttpStatus.UNAUTHORIZED).send({ error: data.error });
		}

		next();
	}
}
