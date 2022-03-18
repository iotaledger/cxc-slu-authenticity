import { HttpService } from '@nestjs/axios';
import {  Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiVersion, ChannelClient, ChannelData, ChannelInfo, ClientConfig } from 'iota-is-sdk/lib';
import { firstValueFrom } from 'rxjs';
import { SluDataDto } from './model/SluDataDto';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { IdentityService } from '../identity/identity.service';
import { Identity } from '../identity/schemas/identity.schema';

@Injectable()
export class SludataService {
	constructor(private configService: ConfigService, private httpService: HttpService,
		private identitiyService: IdentityService) {}

	async checkAuthProve(id: string): Promise<boolean>{
		const expirationTime = this.configService.get('AUTH_PROVE_EXPIRATION');
		const from = new Date();
		from.setMilliseconds(from.getMilliseconds() - expirationTime);
		const identities: Identity[] = await this.identitiyService.getAuthProves(id, from, new Date());
		if(identities.length === 0) return false; 
		return true;
	}	

	async sendDataToConnector(data: SluDataDto): Promise<void>{
		const mpowerUrl = this.configService.get<string>('MPOWER_CONNECTOR_URL');
		await firstValueFrom(this.httpService.post(mpowerUrl, data));
	}

	async writeDataToChannel(data: SluDataDto): Promise<ChannelData> {
		const collectorIdPath = this.configService.get<string>('COLLECTOR_ID_PATH');
		const collectorJson = fs.readFileSync(collectorIdPath, 'utf-8');
		const collector = JSON.parse(collectorJson);
		const clientConfig: ClientConfig = {
			apiKey: this.configService.get('IS_API_KEY'),
			baseUrl: this.configService.get('IS_API_URL'),
			apiVersion: ApiVersion.v01
		};
		const channelClient = new ChannelClient(clientConfig);
		await channelClient.authenticate(collector.doc.id, collector.key.secret);
		const channelInfo: ChannelInfo[] = await channelClient.search({ authorId: collector.doc.id });

		const hashedData = crypto.createHash('sha256').update(JSON.stringify(data.payload)).digest().toString('hex');

		return await channelClient.write(channelInfo[0].channelAddress, { payload: { hashedData: hashedData, deviceId: data.deviceId } });
	}
}
