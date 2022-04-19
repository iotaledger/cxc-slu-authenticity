import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiVersion, ChannelClient, ChannelInfo } from '@iota/is-client';

@Injectable()
export class ChannelSubscriptionService {
	private readonly logger: Logger = new Logger(ChannelSubscriptionService.name);

	constructor(private configService: ConfigService, @Inject('ChannelClient') private channelClient: ChannelClient) {}

	async get(url: string, params: any = {}) {
		console.log(url);
	}

	async channelSubscription() {
		try {
			const collectorDid = this.configService.get<string>('COLLECTOR_DID');
			const collectorSecret = this.configService.get<string>('COLLECTOR_SECRET');
			await this.channelClient.authenticate(collectorDid, collectorSecret);

			const channelInfo: ChannelInfo[] = await this.channelClient.search({
				topicType: 'slu-data1',
				topicSource: 'slu',
				authorId: collectorDid
			});

			if (channelInfo.length != 0) {
				this.logger.log("Found existing channel: " + channelInfo[0].channelAddress);
			} else {
				this.logger.log('creating a new channel...');
				const response = await this.channelClient.create({
					topics: [{ type: 'slu-data1', source: 'slu' }]
				});
				this.logger.log("Created channel: " + response.channelAddress);
			}
		} catch (e) {
			console.log('error', e);
		}
	}
}
