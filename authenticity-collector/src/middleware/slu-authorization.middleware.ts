import { IdentityClient } from '@iota/is-client';
import { HttpStatus, Inject, Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class SluAuthorizationMiddleware implements NestMiddleware {
	constructor(@Inject('IdentityClient') private identityClient: IdentityClient) { }

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

		const { isValid, error } = await this.identityClient.verifyJwt({ jwt: token });

		if (!isValid) {
			return res.status(HttpStatus.UNAUTHORIZED).send({ error: error });
		}

		next();
	}
}
