import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';

@Injectable()
export class SluAuthorizationMiddleware implements NestMiddleware {

  constructor(private configService: ConfigService){}

  use(req: any, res: any, next: () => void) {

    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer')) {
      return res.status(HttpStatus.UNAUTHORIZED).send({ error: 'not authenticated' });
    }

    const split = authorization.split('Bearer ');
    if (split.length !== 2) {
      return res.status(HttpStatus.UNAUTHORIZED).send({ error: 'not authenticated!' });
    }

    const token = split[1];
    const jwt_secret = this.configService.get('JWT_SECRET');
    const decodedToken: any = jwt.verify(token, jwt_secret);

    if (typeof decodedToken === 'string' || !decodedToken?.user) {
      return res.status(HttpStatus.UNAUTHORIZED).send({ error: 'not authenticated!' });
    }

    next();
  }
}
