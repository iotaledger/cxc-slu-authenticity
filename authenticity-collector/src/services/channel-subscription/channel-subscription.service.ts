import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {  ChannelClient, ChannelInfo } from '@iota/is-client';

@Injectable()
export class ChannelSubscriptionService {
	private readonly logger: Logger = new Logger(ChannelSubscriptionService.name);

	constructor(private configService: ConfigService, @Inject('ChannelClient') private channelClient: ChannelClient) {}

	async get(url: string, params: any = {}) {
		console.log(url)
	}

	async authenticate(id: string, secretKey: string) {
		const url = this.channelClient.isGatewayUrl ? this.channelClient.isGatewayUrl : this.channelClient.ssiBridgeUrl;
		const body = await this.get(`${url}/authentication/prove-ownership/${id}`);
	}

	async channelSubscription() {
		try {
			const collectorDid = this.configService.get<string>('COLLECTOR_DID');
			const collectorSecret = this.configService.get<string>('COLLECTOR_SECRET');
			await this.channelClient.authenticate(collectorDid, collectorSecret);
			const channelInfo: ChannelInfo[] = await this.channelClient.search({ topicType: 'slu-data', topicSource: "slu", authorId: collectorDid });
			console.log(channelInfo);
			if (channelInfo.length != 0) {
				this.logger.log(channelInfo[0].channelAddress);
			} else {
				await this.channelClient.create({
					topics: [{ type: 'slu-data', source: 'slu' }]
				});
			}
		}
		catch (e) {
			console.log("error", e)
		}
	}
}
