import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { ChannelClient, ChannelData, ChannelInfo } from 'iota-is-sdk';
import { ClientConfig, ApiVersion } from 'iota-is-sdk';

@Injectable()
export class ChannelSubscriptionService {
	private readonly logger: Logger = new Logger(ChannelSubscriptionService.name);
	private clientConfig: ClientConfig = {
		apiKey: this.configService.get('API_KEY'),
		baseUrl: this.configService.get('API_URL'),
		apiVersion: ApiVersion.v01
	};
	private channelClient = new ChannelClient(this.clientConfig);
	private collector: any;

	constructor(private configService: ConfigService) {}

	async authenticate(){
		const collectorIdPath = this.configService.get<string>('COLLECTOR_ID_PATH');
		const collectorJson = fs.readFileSync(collectorIdPath, 'utf-8');
		const collector = JSON.parse(collectorJson);
		await this.channelClient.authenticate(collector.doc.id, collector.key.secret);
	}
	async channelSubscription() {
		this.authenticate();
		const channelInfo: ChannelInfo[] = await this.channelClient.search({ authorId: this.collector.doc.id });
		if (channelInfo.length != 0) {
			this.logger.log(channelInfo[0].channelAddress);
		} else {
			await this.channelClient.create({
				topics: [{ type: 'slu-data', source: 'slu' }]
			});
		}
	}

	async writeIntoChannel(data: any): Promise<ChannelData>{
		this.authenticate();
		const channelInfo: ChannelInfo[] = await this.channelClient.search({ authorId: this.collector.doc.id });
		const channelAddress = channelInfo[0].channelAddress;
		return await this.channelClient.write(channelAddress, data);
	}
}
