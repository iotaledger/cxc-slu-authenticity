import { Inject, Injectable } from '@nestjs/common';
import { IdentityClient, IdentityJson } from 'iota-is-sdk/lib';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CollectorIdentityService {
	constructor(private configService: ConfigService, @Inject('IdentityClient') private identityClient: IdentityClient) {}

	async checkCollectorIdentity() {
		const id: string = this.configService.get('COLLECTOR_DID');
		const secret: string = this.configService.get('COLLECTOR_SECRET');
		let collectorIdentity: IdentityJson;
		if (id && secret) {
			try {
				collectorIdentity = JSON.parse(fs.readFileSync('./collector-identity.json', 'utf-8'));
				if (collectorIdentity && (collectorIdentity?.doc?.id !== id || collectorIdentity?.key?.secret !== secret)) {
					//if provided env vars are not the same like in the file, assign them with the values of the file
					process.env.COLLECTOR_DID = collectorIdentity.doc.id;
					process.env.COLLECTOR_SECRET = collectorIdentity.key.secret;
					fs.rmSync('./collector-identity.json');
				}
			} catch (ex: any) {
				//No identity file available, just authenticate the identity with the provided env vars
				await this.identityClient.authenticate(id, secret);
			}
		} else {
			collectorIdentity = await this.identityClient.create('authenticity-collector ' + Math.ceil(Math.random() * 1000));
			process.env.COLLECTOR_DID = collectorIdentity.doc.id;
			process.env.COLLECTOR_SECRET = collectorIdentity.key.secret;
			fs.writeFileSync('collector-identity.json', collectorIdentity.toString());
		}
	}
}
