import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ChannelClient, ChannelData } from 'iota-is-sdk/lib';
import { of } from 'rxjs';
import { SludataService } from './sludata.service';
import * as crypto from 'crypto';

describe('SludataService', () => {
	let service: SludataService;
	let httpService: HttpService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule, HttpModule],
			providers: [SludataService]
		}).compile();
		service = module.get<SludataService>(SludataService);
		httpService = module.get<HttpService>(HttpService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should write data into channel', async () => {
		const response = {
			data: {
				success: true
			},
			headers: {},
			config: {},
			status: 200,
			statusText: 'OK'
		};

		const searchResponse = [
			{
				channelAddress: '100a9101d361a1e3657681182a5f2784bb4e02c332fdc426ac4dc5b67d9eced10000000000000000:c2fe471fd08bc988b9cb2de8',
				authorId: 'did:iota:1234',
				subscriberIds: [],
				topics: [
					{
						type: 'sensor data',
						source: 'slu'
					}
				],
				created: '',
				latestMessage: ''
			}
		];

		const channelData: ChannelData = {
			link: 'someString',
			log: {
				payload: {
					hashedData: '121392infiob9w7f2oinf',
					deviceId: 'did:iota:12345'
				}
			}
		};

		const sluDataBody = {
			payload: { temperature: '60 degrees' },
			deviceId: 'did:iota:12345'
		};

		httpService.post = jest.fn().mockImplementationOnce(() => of(response));
		const authSpy = jest.spyOn(ChannelClient.prototype, 'authenticate').mockResolvedValueOnce();
		const searchSpy = jest.spyOn(ChannelClient.prototype, 'search').mockResolvedValue(searchResponse);
		const writeSpy = jest.spyOn(ChannelClient.prototype, 'write').mockResolvedValue(channelData);
		const cryptoSpy = jest.spyOn(crypto, 'createHash');

		const result = await service.writeData(sluDataBody);

		expect(httpService.post).toBeCalled();
		expect(authSpy).toBeCalled();
		expect(searchSpy).toBeCalled();
		expect(writeSpy).toBeCalled();
		expect(cryptoSpy).toBeCalled();
		expect(result).toBe(channelData);
	});
});
