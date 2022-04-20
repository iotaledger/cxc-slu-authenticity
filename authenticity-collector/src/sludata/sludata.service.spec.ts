import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ChannelClient, ChannelData } from '@iota/is-client';
import { SludataService } from './sludata.service';
import * as crypto from 'crypto';
import { IdentityModule } from '../identity/identity.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { IdentitySchema } from '../identity/schemas/identity.schema';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { IdentityService } from '../identity/identity.service';
import { of } from 'rxjs';

describe('SludataService', () => {
	let service: SludataService;
	let httpService: HttpService;
	let mongod: MongoMemoryServer;
	let connection: Connection;
	let identityService: IdentityService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				ConfigModule.forRoot({ isGlobal: true }),
				HttpModule,
				IdentityModule,
				MongooseModule.forRootAsync({
					useFactory: async () => {
						mongod = await MongoMemoryServer.create();
						const mongoUri = await mongod.getUri();
						return {
							uri: mongoUri
						};
					}
				}),
				MongooseModule.forFeature([{ name: 'Identity', schema: IdentitySchema }])
			],
			providers: [SludataService]
		}).compile();

		service = module.get<SludataService>(SludataService);
		httpService = module.get<HttpService>(HttpService);
		connection = module.get<Connection>(getConnectionToken());
		identityService = module.get<IdentityService>(IdentityService);
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
				name: '',
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

		const authSpy = jest.spyOn(ChannelClient.prototype, 'authenticate').mockResolvedValueOnce();
		const searchSpy = jest.spyOn(ChannelClient.prototype, 'search').mockResolvedValue(searchResponse);
		const writeSpy = jest.spyOn(ChannelClient.prototype, 'write').mockResolvedValue(channelData);
		const cryptoSpy = jest.spyOn(crypto, 'createHash');

		const result = await service.writeDataToChannel(sluDataBody);

		expect(authSpy).toBeCalled();
		expect(searchSpy).toBeCalled();
		expect(writeSpy).toBeCalled();
		expect(cryptoSpy).toBeCalled();
		expect(result).toBe(channelData);
	});

	it('should check authentication prove: true', async () => {
		const identity = {
			did: 'did:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
			timestamp: new Date('2022-01-27T13:04:18.559Z'),
			signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
		};

		const identityServiceSpy = jest.spyOn(identityService, 'getAuthProves').mockResolvedValue([identity]);

		const result = await service.checkAuthProve('did:iota:12345');

		expect(identityServiceSpy).toBeCalled();
		expect(result).toBe(true);
	});

	it('should check authentication prove: false', async () => {
		const identityServiceSpy = jest.spyOn(identityService, 'getAuthProves').mockResolvedValue([]);

		const result = await service.checkAuthProve('did:iota:12345');

		expect(identityServiceSpy).toBeCalled();
		expect(result).toBe(false);
	});

	it('should send data to mpower connector', async () => {
		const response = {
			data: {
				success: true
			},
			headers: {},
			config: {},
			status: 200,
			statusText: 'OK'
		};

		const sluDataBody = {
			payload: { temperature: '60 degrees' },
			deviceId: 'did:iota:12345'
		};

		const httpServiceSpy = jest.spyOn(httpService, 'post').mockImplementation(() => of(response));

		await service.sendDataToConnector(sluDataBody);

		expect(httpServiceSpy).toBeCalledWith('https://en5mzd9ir2abq.x.pipedream.net/', sluDataBody);
	});

	afterEach(async () => {
		await connection.close();
		if (mongod) mongod.stop();
	});
});
