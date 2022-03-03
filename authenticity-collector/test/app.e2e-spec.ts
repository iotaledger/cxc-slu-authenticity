import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Identity, IdentityDocument, IdentitySchema } from '../src/identity/schemas/identity.schema';
import { Model } from 'mongoose';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('AppController (e2e)', () => {
	let app: INestApplication;
	let identityModel: Model<IdentityDocument>;
	let mongod: MongoMemoryServer;
	let httpService: HttpService;
	let identity;
	let identity2;
	let identity3;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				AppModule,
				MongooseModule.forRootAsync({
					useFactory: async () => {
						mongod = await MongoMemoryServer.create({
							instance: {
								port: 6000
							}
						});
						const mongoUri = await mongod.getUri();
						return {
							uri: mongoUri
						};
					}
				}),
				MongooseModule.forFeature([{ name: 'Identity', schema: IdentitySchema }])
			]
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
		httpService = moduleFixture.get<HttpService>(HttpService);
		identityModel = moduleFixture.get<Model<IdentityDocument>>(getModelToken(Identity.name));

		await identityModel.deleteMany();

		identity = {
			did: 'did:iota:4xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
			timestamp: '2022-01-27T13:04:18.559Z',
			signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
		};
		identity2 = {
			did: 'did:iota:4xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
			timestamp: '2022-01-28T13:04:18.559Z',
			signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
		};
		identity3 = {
			did: 'did:iota:4xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
			timestamp: '2022-01-29T13:04:18.559Z',
			signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
		};

		await new identityModel(identity).save();
		await new identityModel(identity2).save();
		await new identityModel(identity3).save();
	});

	it('/prove (GET)', async () => {
		let { status, body } = await request(app.getHttpServer()).get(
			'/identity/prove?did=did:iota:4xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd&from=2022-01-27&to=2022-01-28'
		);

		let device = body[0];
		let savedIdentity: Identity = {
			did: device.did,
			timestamp: device.timestamp,
			signature: device.signature
		};

		expect(status).toBe(200);
		expect(savedIdentity).toEqual(identity);
	});

	it('/prove (GET - Invalid time value)', async () => {
		let { status, body } = await request(app.getHttpServer()).get(
			'/identity/prove?did=did:iota:4xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd&from=202201-27&to=2022-01-28'
		);

		expect(status).toBe(500);
		expect(body.message).toEqual('Internal server error');
	});

	it('/prove (GET - Empty list)', async () => {
		let { status, body } = await request(app.getHttpServer()).get(
			'/identity/prove?did=did:iota:4xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd&from=2022-01-25&to=2022-01-25'
		);

		expect(status).toBe(200);
		expect(body).toEqual([]);
	});

	it('/prove (GET - should return two entries)', async () => {
		let { status, body } = await request(app.getHttpServer()).get(
			'/identity/prove?did=did:iota:4xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd&from=2022-01-27&to=2022-01-29'
		);

		let device = body[0];
		let savedIdentity: Identity = {
			did: device.did,
			timestamp: device.timestamp,
			signature: device.signature
		};

		let device2 = body[1];
		let savedIdentity2: Identity = {
			did: device2.did,
			timestamp: device2.timestamp,
			signature: device2.signature
		};

		expect(status).toBe(200);
		expect([savedIdentity, savedIdentity2]).toEqual([identity, identity2]);
	});

	it('/prove (POST - prove succeed)', async () => {
		let identity = {
			did: 'did:iota:5xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
			timestamp: '2022-01-27T13:04:18.559Z',
			signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
		};

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

		jest.spyOn(httpService, 'post').mockReturnValue(of(response));

		let { status, body } = await request(app.getHttpServer()).post('/identity/prove').send(identity);

		let savedIdentity: Identity = {
			did: body.did,
			timestamp: body.timestamp,
			signature: body.signature
		};

		expect(status).toBe(201);
		expect(savedIdentity).toEqual(identity);
	});

	it('/prove (POST - prove fails)', async () => {
		let identity = {
			did: 'did:iota:5xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
			timestamp: '2022-01-27T13:04:18.559Z',
			signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
		};
		const response = {
			data: {
				success: false,
				error: 'Prove failed'
			},
			headers: {},
			config: { url: 'http://localhost:3000/mockUrl' },
			status: 200,
			statusText: 'OK'
		};

		jest.spyOn(httpService, 'post').mockReturnValue(of(response));

		let { status, body } = await request(app.getHttpServer()).post('/identity/prove').send(identity);

		expect(status).toBe(400);
		expect(body.message).toEqual('Prove failed');
	});

	it('/prove (POST - Verification failed: wrong signature)', async () => {
		let identity = {
			did: 'did:iota:5xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
			timestamp: '2022-01-27T13:04:18.559Z',
			signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
		};
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

		jest.spyOn(httpService, 'post').mockReturnValue(of(response));

		let { status, body } = await request(app.getHttpServer()).post('/identity/prove').send(identity);

		expect(status).toBe(400);
		expect(body.message).toEqual('Verification failed: wrong signature');
	});

	it('/prove (POST - date validation fails)', async () => {
		let identity = {
			did: 'did:iota:5xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
			timestamp: '2021-11-27T08:4733Z',
			signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
		};
		let { status, body } = await request(app.getHttpServer()).post('/identity/prove').send(identity);

		expect(status).toBe(400);
		expect(body.message).toEqual('Validation failed');
	});

	it('/prove (POST - DID validation fails)', async () => {
		let identity = {
			did: 'dd:iota:5xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
			timestamp: '2022-01-27T13:04:18.559Z',
			signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
		};
		let { status, body } = await request(app.getHttpServer()).post('/identity/prove').send(identity);

		expect(status).toBe(400);
		expect(body.message).toEqual('Validation failed');
	});

	afterAll(async () => {
		app.close();
		mongod.stop();
	});
});
