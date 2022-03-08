import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiVersion, ChannelClient, ChannelData, ChannelInfo, ClientConfig } from 'iota-is-sdk/lib';
import { firstValueFrom } from 'rxjs';
import { SluDataDto } from './model/SluDataDto';
import * as fs from 'fs'

@Injectable()
export class SludataService {
	constructor(
		private configService: ConfigService,
		private httpService: HttpService,
	) {}

	async writeData(data: SluDataDto): Promise<ChannelData> {
		const mpowerUrl = this.configService.get<string>('MPOWER_CONNECTOR_URL');
		await firstValueFrom(this.httpService.post(mpowerUrl, data));
		const collectorIdPath = this.configService.get<string>('COLLECTOR_ID_PATH');
		const collectorJson = fs.readFileSync(collectorIdPath, 'utf-8');
		const collector = JSON.parse(collectorJson);
		const clientConfig: ClientConfig = {
			apiKey: this.configService.get('API_KEY'),
			baseUrl: this.configService.get('API_URL'),
			apiVersion: ApiVersion.v01
		};
		const channelClient = new ChannelClient(clientConfig);
		await channelClient.authenticate(collector.doc.id, collector.key.secret);
		const channelInfo: ChannelInfo[] = await channelClient.search({ authorId: collector.doc.id });

		return await channelClient.write(channelInfo[0].channelAddress, {payload: data});		
	}
}
