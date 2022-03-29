import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { ChannelClient, ChannelInfo } from 'iota-is-sdk';
import { ClientConfig, ApiVersion } from 'iota-is-sdk';

@Injectable()
export class ChannelSubscriptionService {
	private readonly logger: Logger = new Logger(ChannelSubscriptionService.name);

	constructor(private configService: ConfigService) {}

	async channelSubscription() {
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
		if (channelInfo.length != 0) {
			this.logger.log(channelInfo[0].channelAddress);
		} else {
			await channelClient.create({
				topics: [{ type: 'slu-data', source: 'slu' }]
			});
		}
	}
}
