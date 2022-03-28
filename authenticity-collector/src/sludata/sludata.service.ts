import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiVersion, ChannelClient, ChannelData, ChannelInfo, ClientConfig } from 'iota-is-sdk/lib';
import { firstValueFrom } from 'rxjs';
import { SluDataDto } from './model/SluDataDto';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Injectable()
export class SludataService {
	constructor(private configService: ConfigService, private httpService: HttpService) {}

	async writeData(data: SluDataDto): Promise<ChannelData> {
		const mpowerUrl = this.configService.get<string>('MPOWER_CONNECTOR_URL');
		await firstValueFrom(this.httpService.post(mpowerUrl, data));
		const collectorDid = this.configService.get<string>('COLLECTOR_DID');
		const collectorSecret = this.configService.get<string>('COLLECTOR_SECRET');
		const clientConfig: ClientConfig = {
			apiKey: this.configService.get('IS_API_KEY'),
			baseUrl: this.configService.get('IS_API_URL'),
			apiVersion: ApiVersion.v01
		};
		const channelClient = new ChannelClient(clientConfig);
		await channelClient.authenticate(collectorDid, collectorSecret);
		const channelInfo: ChannelInfo[] = await channelClient.search({ authorId: collectorDid });

		const hashedData = crypto.createHash('sha256').update(JSON.stringify(data.payload)).digest().toString('hex');

		return await channelClient.write(channelInfo[0].channelAddress, { payload: { hashedData: hashedData, deviceId: data.deviceId } });
	}
}
