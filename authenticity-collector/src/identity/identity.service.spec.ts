import { Test, TestingModule } from '@nestjs/testing';
import { IdentityService } from './identity.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Identity, IdentityDocument, IdentitySchema } from './schemas/identity.schema';
import { HttpModule, HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ConfigModule } from '@nestjs/config';
import { Connection, Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { IdentityDto } from './models/IdentityDto';

describe('IdentityService', () => {
	let service: IdentityService;
	let httpService: HttpService;
	let mongod: MongoMemoryServer;
	let body: IdentityDto;
	let identityModel: Model<IdentityDocument>;
	let connection: Connection;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				HttpModule,
				ConfigModule,
				MongooseModule.forRootAsync({
					useFactory: async () => {
						mongod = await MongoMemoryServer.create();
						let mongoUri = await mongod.getUri();
						return {
							uri: mongoUri
						};
					}
				}),
				MongooseModule.forFeature([{ name: 'Identity', schema: IdentitySchema }])
			],
			providers: [IdentityService]
		}).compile();

		service = module.get<IdentityService>(IdentityService);
		httpService = module.get<HttpService>(HttpService);
		connection = module.get<Connection>(getConnectionToken());

		identityModel = module.get<Model<IdentityDocument>>(getModelToken(Identity.name));

		body = {
			did: 'did:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
			timestamp: new Date('2022-01-27T13:04:18.559Z'),
			signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
		};
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should save identity', async () => {
		const response = {
			data: {
				success: true,
				isVerified: true
			},
			headers: {},
			config: { url: 'http://localhost:3000/mockUrl' },
			status: 200,
			statusText: 'OK'
		};

		jest.spyOn(httpService, 'post').mockImplementationOnce(() => of(response));

		const result = await service.proveAndSaveSlu(body);
		let savedDevice = await identityModel.find({ did: body.did }).lean();

		expect(result).toEqual(savedDevice[0]);
	});

	it('should fail saving wrong identity', async () => {
		const response = {
			data: {
				success: true,
				isVerified: true
			},
			headers: {},
			config: { url: 'http://localhost:3000/mockUrl' },
			status: 200,
			statusText: 'OK'
		};

		jest.spyOn(httpService, 'post').mockImplementationOnce(() => of(response));

		let wrongIdentity = {
			_id: 'did:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
			did: 'did:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
			timestamp: new Date('2022-01-27T13:04:18.559Z'),
			signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
		};

		try {
			await service.proveAndSaveSlu(wrongIdentity);
		} catch (ex: any) {
			expect(ex.message).toBe(
				'Identity validation failed: _id: Cast to ObjectId failed for value "did:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd" (type string) at path "_id"'
			);
		}
	});

	it('should not save identity: verification fails', async () => {
		const response = {
			data: {
				success: true,
				isVerified: false
			},
			headers: {},
			config: { url: 'http://localhost:3000/mockUrl' },
			status: 200,
			statusText: 'OK'
		};

		let badrequest: BadRequestException;
		jest.spyOn(httpService, 'post').mockImplementationOnce(() => of(response));
		try {
			await service.proveAndSaveSlu(body);
		} catch (ex: any) {
			badrequest = ex;
		}
		expect(badrequest.getStatus()).toBe(400);
		expect(badrequest.getResponse()['message']).toBe('Verification failed: wrong signature');
	});

	it('should not save identity: error proving identity', async () => {
		const response = {
			data: {
				success: false,
				error: 'Could not prove identity'
			},
			headers: {},
			config: { url: 'http://localhost:3000/mockUrl' },
			status: 200,
			statusText: 'OK'
		};

		let badrequest: BadRequestException;
		jest.spyOn(httpService, 'post').mockImplementationOnce(() => of(response));
		try {
			await service.proveAndSaveSlu(body);
		} catch (ex: any) {
			badrequest = ex;
		}
		expect(badrequest.getStatus()).toBe(400);
		expect(badrequest.getResponse()['message']).toBe('Could not prove identity');
	});

	it('should return saved devices', async () => {
		await new identityModel(body).save();

		let did = 'did:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd';
		let from = '2022-01-27T13:04:18.559Z';
		let to = '2022-01-27T13:04:18.559Z';

		let result = await service.getAuthProves(did, from, to);
		let savedDevice = await identityModel.find({ did: body.did }).lean();

		expect(result).toEqual(savedDevice);
	});

	it('should fail to return saved devices: Invalid time value', async () => {
		await new identityModel(body).save();

		let did = 'did:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd';
		let from = '2022-01-27T13:04:18.559Z';
		let to = '202101-27T13:04:18.559Z';

		try {
			await service.getAuthProves(did, from, to);
		} catch (ex: any) {
			expect(ex.message).toBe('Invalid time value');
		}
	});

	afterEach(async () => {
		await connection.close();
		if (mongod) mongod.stop();
	});
});
