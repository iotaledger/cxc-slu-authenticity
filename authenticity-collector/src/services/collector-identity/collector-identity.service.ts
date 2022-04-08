import { Inject, Injectable } from '@nestjs/common';
import { IdentityClient, IdentityJson } from 'iota-is-sdk/lib';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CollectorIdentityService {
	constructor(private configService: ConfigService, @Inject('IdentityClient') private identityClient: IdentityClient) { }

	async checkCollectorIdentity() {
		const id: string = this.configService.get('COLLECTOR_DID');
		const secret: string = this.configService.get('COLLECTOR_SECRET');
		if (id && secret) {
			await this.identityClient.authenticate(id, secret);
		} else {
			throw new Error('no COLLECTOR_DID and/or COLLECTOR_SECRET is provided')
		}
	}
}
