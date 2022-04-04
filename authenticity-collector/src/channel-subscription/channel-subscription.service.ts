import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChannelClient, ChannelInfo } from 'iota-is-sdk';

@Injectable()
export class ChannelSubscriptionService {
	private readonly logger: Logger = new Logger(ChannelSubscriptionService.name);

	constructor(private configService: ConfigService, @Inject('ChannelClient') private channelClient: ChannelClient) { }

	async channelSubscription() {
		const collectorDid = this.configService.get<string>('COLLECTOR_DID');
		const collectorSecret = this.configService.get<string>('COLLECTOR_SECRET');
		await this.channelClient.authenticate(collectorDid, collectorSecret);
		const channelInfo: ChannelInfo[] = await this.channelClient.search({ authorId: collectorDid });
		if (channelInfo.length != 0) {
			this.logger.log(channelInfo[0].channelAddress);
		} else {
			await this.channelClient.create({
				topics: [{ type: 'slu-data', source: 'slu' }]
			});
		}
	}
}
