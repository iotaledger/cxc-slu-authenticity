import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { SluDataDto } from './model/SluDataDto';
import { SluDataController } from './sludata.controller';
import { SluDataService } from './sludata.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { IdentitySchema } from '../identity/schemas/identity.schema';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { IdentityModule } from '../identity/identity.module';
import { Response } from 'express';

describe('SludataController', () => {
	let controller: SluDataController;
	let sluDataBody: SluDataDto;
	let mongod: MongoMemoryServer;
	let connection: Connection;
	let sludataService: SluDataService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				HttpModule,
				IdentityModule,
				ConfigModule.forRoot({ isGlobal: true }),
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
			controllers: [SluDataController],
			providers: [SluDataService]
		}).compile();

		controller = module.get<SluDataController>(SluDataController);
		connection = module.get<Connection>(getConnectionToken());
		sludataService = module.get<SluDataService>(SluDataService);

		sluDataBody = {
			payload: { temperature: '60 degress' },
			deviceId: 'did:iota:12345'
		};
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should return ChannelData', async () => {
		const body = {
			link: '100a9101d361a1e3657681182a5f2784bb4e02c332fdc426ac4dc5b67d9eced10000000000000000:9d7eb01c80434db6ccde4a18',
			messageId: '455e4e325a34e2406d153a9a6587526f6f651d4c03af2b0ab0364a763e6831f9',
			log: {
				created: '2022-03-09T14:21:55Z',
				payload: {
					hashedData: 'U2FsdGVkX199lBknVEUkXZvpyPu+Gcz1hiEVjtNAywwC12yvuY+Vbca50pVhbfA4',
					deviceId: 'did:iota:122'
				}
			}
		};

		let resultStatus = {};
		let resultJson = {};

		const mockResponse: Partial<Response> = {
			status: jest.fn().mockImplementation((result) => {
				resultStatus = result;
				return mockResponse;
			}),
			json: jest.fn().mockImplementation((result) => {
				resultJson = result;
				return mockResponse;
			})
		};

		const serviceSpy = jest.spyOn(sludataService, 'writeDataToChannel').mockResolvedValue(body);
		const checkAuthProve = jest.spyOn(sludataService, 'checkAuthProve').mockResolvedValue(true);
		const sendDataToConnector = jest.spyOn(sludataService, 'sendDataToConnector');

		await controller.writeData(sluDataBody, mockResponse as Response);

		expect(checkAuthProve).toBeCalled();
		expect(sendDataToConnector).toBeCalled();
		expect(serviceSpy).toBeCalled();
		expect(resultJson).toBe(body);
		expect(resultStatus).toBe(201);
	});

	it('should fail to return ChannelData', async () => {
		let resultStatus = {};
		let resultJson = {};

		const mockResponse: Partial<Response> = {
			status: jest.fn().mockImplementation((result) => {
				resultStatus = result;
				return mockResponse;
			}),
			send: jest.fn().mockImplementation((result) => {
				resultJson = result;
				return mockResponse;
			})
		};
		const checkAuthProve = jest.spyOn(sludataService, 'checkAuthProve').mockResolvedValue(false);

		await controller.writeData(sluDataBody, mockResponse as Response);

		expect(checkAuthProve).toBeCalled();
		expect(resultJson).toEqual({ error: 'authentication prove expired' });
		expect(resultStatus).toBe(409);
	});

	afterEach(async () => {
		await connection.close();
		if (mongod) mongod.stop();
	});
});
