import { ChannelClient, ChannelInfo, CreateChannelResponse } from 'iota-is-sdk/lib';
import { channelSubscription } from './channelSubscription';

describe('channel cubscription test', () => {
	let channelInfo: ChannelInfo;
	beforeEach(() => {
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
	});

	it('should create channel', async () => {
		const createChannelResponse: CreateChannelResponse = {
			channelAddress: '100a9101d361a1e3657681182a5f2784bb4e02c332fdc426ac4dc5b67d9eced10000000000000000:c2fe471fd08bc988b9cb2de8'
		};
		const channelClientSpy = jest.spyOn(ChannelClient.prototype, 'authenticate').mockResolvedValueOnce();
		const searchSpy = jest.spyOn(ChannelClient.prototype, 'search').mockResolvedValueOnce([]);
		const createSpy = jest.spyOn(ChannelClient.prototype, 'create').mockImplementationOnce(() => Promise.resolve(createChannelResponse));
		const consoleSpy = jest.spyOn(console, 'log');

		await channelSubscription();

		expect(channelClientSpy).toBeCalled();
		expect(searchSpy).toBeCalled();
		expect(createSpy).toBeCalled();
		expect(consoleSpy).not.toBeCalled();
	});

	it('should log existing channel', async () => {
		const channelClientSpy = jest.spyOn(ChannelClient.prototype, 'authenticate').mockResolvedValueOnce();
		const searchSpy = jest.spyOn(ChannelClient.prototype, 'search').mockResolvedValueOnce([channelInfo]);
		const consoleSpy = jest.spyOn(console, 'log');

		await channelSubscription();

		expect(channelClientSpy).toBeCalled();
		expect(searchSpy).toBeCalled();
		expect(consoleSpy).toHaveBeenCalledWith(
			'100a9101d361a1e3657681182a5f2784bb4e02c332fdc426ac4dc5b67d9eced10000000000000000:c2fe471fd08bc988b9cb2de8'
		);
	});

	it('should throw error', async () => {
		process.env.COLLECTOR_ID = '';
		const consolSpy = jest.spyOn(console, 'error');
		await channelSubscription();
		expect(consolSpy).toBeCalled();
	});
});
