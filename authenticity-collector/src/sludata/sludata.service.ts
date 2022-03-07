import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChannelData } from 'iota-is-sdk/lib';
import { firstValueFrom } from 'rxjs';
import { ChannelSubscriptionService } from '../channel-subscription/channel-subscription.service';
import { SluDataDto } from './model/SluDataDto';

@Injectable()
export class SludataService {
	constructor(
		private configService: ConfigService,
		private httpService: HttpService,
		private channelSubscription: ChannelSubscriptionService
	) {}

	async writeData(data: SluDataDto): Promise<ChannelData> {
		const mpowerUrl = this.configService.get<string>('MPOWER_CONNECTOR');
		firstValueFrom(this.httpService.post(mpowerUrl, data));
		return null//this.channelSubscription.writeIntoChannel(data);
	}
}
