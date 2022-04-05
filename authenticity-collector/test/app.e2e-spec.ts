import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Identity, IdentityDocument, IdentitySchema } from '../src/identity/schemas/identity.schema';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('AppController (e2e)', () => {
	let app: INestApplication;
	let identityModel: Model<IdentityDocument>;
	let mongod: MongoMemoryServer;
	let httpService: HttpService;
	let connection: Connection;
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
		connection = moduleFixture.get<Connection>(getConnectionToken());

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

	describe('/api/v1/authenticity (Authentication)', () => {
		it('/prove (GET)', async () => {
			let { status, body } = await request(app.getHttpServer()).get(
				'/api/v1/authenticity/prove?did=did:iota:4xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd&from=2022-01-27&to=2022-01-28'
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
				'/api/v1/authenticity/prove?did=did:iota:4xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd&from=202201-27&to=2022-01-28'
			);

			expect(status).toBe(500);
			expect(body.message).toEqual('Internal server error');
		});

		it('/prove (GET - Empty list)', async () => {
			let { status, body } = await request(app.getHttpServer()).get(
				'/api/v1/authenticity/prove?did=did:iota:4xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd&from=2022-01-25&to=2022-01-25'
			);

			expect(status).toBe(200);
			expect(body).toEqual([]);
		});

		it('/prove (GET - should return two entries)', async () => {
			let { status, body } = await request(app.getHttpServer()).get(
				'/api/v1/authenticity/prove?did=did:iota:4xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd&from=2022-01-27&to=2022-01-29'
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

			let { status, body } = await request(app.getHttpServer()).post('/api/v1/authenticity/prove').send(identity);

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

			let { status, body } = await request(app.getHttpServer()).post('/api/v1/authenticity/prove').send(identity);

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

			let { status, body } = await request(app.getHttpServer()).post('/api/v1/authenticity/prove').send(identity);

			expect(status).toBe(400);
			expect(body.message).toEqual('Verification failed: wrong signature');
		});

		it('/prove (POST - date validation fails)', async () => {
			let identity = {
				did: 'did:iota:5xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
				timestamp: '2021-11-27T08:4733Z',
				signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
			};
			let { status, body } = await request(app.getHttpServer()).post('/api/v1/authenticity/prove').send(identity);

			expect(status).toBe(400);
			expect(body.message).toEqual('Validation failed');
		});

		it('/prove (POST - DID validation fails)', async () => {
			let identity = {
				did: 'dd:iota:5xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
				timestamp: '2022-01-27T13:04:18.559Z',
				signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
			};
			let { status, body } = await request(app.getHttpServer()).post('/api/v1/authenticity/prove').send(identity);

			expect(status).toBe(400);
			expect(body.message).toEqual('Validation failed');
		});
	});

	describe('/api/v1/authenticity (Slu data)', () => {
		it('/data (POST)', async () => {
			const identity = {
				did: 'did:iota:Gb6MMq9SCmKb48noEjEoyVMcHjpNwvu2MjDTY6K2XpV',
				timestamp: new Date().toISOString(),
				signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
			};

			await new identityModel(identity).save();

			const sluDataBody = {
				payload: { temperature: '60 degrees' },
				deviceId: 'did:iota:Gb6MMq9SCmKb48noEjEoyVMcHjpNwvu2MjDTY6K2XpV'
			};

			const jwt =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZGlkOmlvdGE6M3A0RWVWNkVRTFJEZDR3ajh1UXhEZTRhTkRTeWk5TUw0WGtuZjhWS1FLU3oiLCJwdWJsaWNLZXkiOiJFWEZ1QXBobW5MR1gxTVFyRzNBcVZhcmNlelduZGhNRU1Db1p3MVVkN3B1QSIsInVzZXJuYW1lIjoibXktZGV2aWNlNDkiLCJyZWdpc3RyYXRpb25EYXRlIjoiMjAyMi0wMy0yNVQxNTo1MjoxNFoiLCJjbGFpbSI6eyJ0eXBlIjoiUGVyc29uIn0sInJvbGUiOiJVc2VyIn0sImlhdCI6MTY0ODMwNjAzOSwiZXhwIjoxNjQ4MzkyNDM5fQ.hdIpqn3LZdzBN9NB5rdXdWk9d3g1uh-sX9LC80DeWRc';

			const { status, body } = await request(app.getHttpServer())
				.post('/api/v1/authenticity/data')
				.set('Authorization', 'Bearer ' + jwt)
				.send(sluDataBody);

			expect(status).toBe(201);
			expect(body.log.payload.deviceId).toBe(sluDataBody.deviceId);
			//SHA256 length in hex format
			expect(body.log.payload.hashedData.length).toBe(64);
			expect(body.log.payload.hashedData).not.toBe(sluDataBody.payload);
		});

		it('/data (POST): Validation fails: old timestamp', async () => {
			const identity = {
				did: 'did:iota:Gb6MMq9SCmKb48noEjEoyVMcHjpNwvu2MjDTY6K2XpV',
				timestamp: '2022-03-18T15:36:57',
				signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
			};

			await new identityModel(identity).save();

			const sluDataBody = {
				payload: { temperature: '60 degrees' },
				deviceId: 'did:iota:Gb6MMq9SCmKb48noEjEoyVMcHjpNwvu2MjDTY6K2XpV'
			};

			const jwt =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZGlkOmlvdGE6M3A0RWVWNkVRTFJEZDR3ajh1UXhEZTRhTkRTeWk5TUw0WGtuZjhWS1FLU3oiLCJwdWJsaWNLZXkiOiJFWEZ1QXBobW5MR1gxTVFyRzNBcVZhcmNlelduZGhNRU1Db1p3MVVkN3B1QSIsInVzZXJuYW1lIjoibXktZGV2aWNlNDkiLCJyZWdpc3RyYXRpb25EYXRlIjoiMjAyMi0wMy0yNVQxNTo1MjoxNFoiLCJjbGFpbSI6eyJ0eXBlIjoiUGVyc29uIn0sInJvbGUiOiJVc2VyIn0sImlhdCI6MTY0ODMwNjAzOSwiZXhwIjoxNjQ4MzkyNDM5fQ.hdIpqn3LZdzBN9NB5rdXdWk9d3g1uh-sX9LC80DeWRc';

			const { status, body } = await request(app.getHttpServer())
				.post('/api/v1/authenticity/data')
				.set('Authorization', 'Bearer ' + jwt)
				.send(sluDataBody);

			expect(status).toBe(409);
			expect(body).toEqual({ error: 'authentication prove expired' });
		});

		it('/data (POST): Validation fails: no payload', async () => {
			const sluDataBody = {
				payload: '',
				deviceId: 'dd:iota:123456'
			};
			const jwt =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZGlkOmlvdGE6M3A0RWVWNkVRTFJEZDR3ajh1UXhEZTRhTkRTeWk5TUw0WGtuZjhWS1FLU3oiLCJwdWJsaWNLZXkiOiJFWEZ1QXBobW5MR1gxTVFyRzNBcVZhcmNlelduZGhNRU1Db1p3MVVkN3B1QSIsInVzZXJuYW1lIjoibXktZGV2aWNlNDkiLCJyZWdpc3RyYXRpb25EYXRlIjoiMjAyMi0wMy0yNVQxNTo1MjoxNFoiLCJjbGFpbSI6eyJ0eXBlIjoiUGVyc29uIn0sInJvbGUiOiJVc2VyIn0sImlhdCI6MTY0ODMwNjAzOSwiZXhwIjoxNjQ4MzkyNDM5fQ.hdIpqn3LZdzBN9NB5rdXdWk9d3g1uh-sX9LC80DeWRc';
			const { status, body } = await request(app.getHttpServer())
				.post('/api/v1/authenticity/data')
				.set('Authorization', 'Bearer ' + jwt)
				.send(sluDataBody);
			expect(status).toBe(400);
			expect(body.message[0]).toEqual('payload should not be empty');
		});

		it('/data (POST): Validation fails: missing jwt', async () => {
			const sluDataBody = {
				payload: { temperature: '60 degrees' },
				deviceId: 'did:iota:Gb6MMq9SCmKb48noEjEoyVMcHjpNwvu2MjDTY6K2XpV'
			};
			const { status, body } = await request(app.getHttpServer()).post('/api/v1/authenticity/data').set('authorization', 'Bearer ').send(sluDataBody);
			expect(status).toBe(401);
			expect(body).toEqual({ error: 'not authenticated!' });
		});
	});

	afterAll(async () => {
		await connection.close();
		if (mongod) await mongod.stop();
		await app.close();
	});
});
