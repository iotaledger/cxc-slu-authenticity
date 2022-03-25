import { Test, TestingModule } from '@nestjs/testing';
import { ChannelSubscriptionService } from './channel-subscription.service';
import { ChannelInfo, CreateChannelResponse, ChannelClient } from 'iota-is-sdk';
import { ConfigModule } from '@nestjs/config';

describe('ChannelSubscriptionService', () => {
	let service: ChannelSubscriptionService;
	let channelInfo: ChannelInfo;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule],
			providers: [ChannelSubscriptionService]
		}).compile();
		channelInfo = {
			channelAddress: '100a9101d361a1e3657681182a5f2784bb4e02c332fdc426ac4dc5b67d9eced10000000000000000:c2fe471fd08bc988b9cb2de8',
			authorId: 'did:iota:12345',
			topics: [
				{
					type: 'slu-data',
					source: 'slu'
				}
			]
		};
		service = module.get<ChannelSubscriptionService>(ChannelSubscriptionService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should create channel', async () => {
		const createChannelResponse: CreateChannelResponse = {
			channelAddress: '100a9101d361a1e3657681182a5f2784bb4e02c332fdc426ac4dc5b67d9eced10000000000000000:c2fe471fd08bc988b9cb2de8'
		};
		const channelClientSpy = jest.spyOn(ChannelClient.prototype, 'authenticate').mockResolvedValueOnce();
		const searchSpy = jest.spyOn(ChannelClient.prototype, 'search').mockResolvedValueOnce([]);
		const createSpy = jest.spyOn(ChannelClient.prototype, 'create').mockImplementationOnce(() => Promise.resolve(createChannelResponse));

		await service.channelSubscription();

		expect(channelClientSpy).toBeCalled();
		expect(searchSpy).toBeCalled();
		expect(createSpy).toBeCalled();
	});

	it('should log existing channel', async () => {
		const channelClientSpy = jest.spyOn(ChannelClient.prototype, 'authenticate').mockResolvedValueOnce();
		const searchSpy = jest.spyOn(ChannelClient.prototype, 'search').mockResolvedValueOnce([channelInfo]);
		await service.channelSubscription();

		expect(channelClientSpy).toBeCalled();
		expect(searchSpy).toBeCalled();
	});

	it('should throw error', async () => {
		process.env.COLLECTOR_DID = '';
		process.env.COLLECTOR_SECRETE = '';
		const error = service.channelSubscription();
		await expect(error).rejects.toThrowError();
	});
});
