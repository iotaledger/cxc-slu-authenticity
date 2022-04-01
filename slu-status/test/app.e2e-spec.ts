import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SluStatus, SluStatusSchema } from '../src/slu-status/schema/slu-status.schema';
import { Model, Connection } from 'mongoose';
import { Status } from '../src/slu-status/model/Status';
import { SluStatusDto } from '../src/slu-status/model/SluStatusDto';
import { SluNonce, SluNonceSchema } from '../src/slu-nonce/schema/slu-nonce.schema';
import { EmptyLogger } from './empty-logger';

describe('AppController (e2e)', () => {
	let app: INestApplication;
	let mongod: MongoMemoryServer;
	let sluStatusModel: Model<SluStatus>;
	let sluNonceModel: Model<SluNonce>;
	let connection: Connection;
	let sluStatus: SluStatusDto;

	beforeAll(async () => {
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
				MongooseModule.forFeature([{ name: SluStatus.name, schema: SluStatusSchema }]),
				MongooseModule.forFeature([{ name: SluNonce.name, schema: SluNonceSchema }])
			]
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
		app.useLogger(new EmptyLogger());
		sluStatusModel = moduleFixture.get<Model<SluStatus>>(getModelToken(SluStatus.name));
		sluNonceModel = moduleFixture.get<Model<SluNonce>>(getModelToken(SluNonce.name));
		connection = moduleFixture.get<Connection>(getConnectionToken());

		await sluStatusModel.deleteMany();

		sluStatus = {
			id: 'did:iota:12345',
			status: Status.CREATED,
			channelAddress: 'anyKindOfAddress'
		};
	});

	describe('/api/v1/status', () => {
		it('/:id (GET)', async () => {
			await new sluStatusModel(sluStatus).save();
			const { status, text } = await request(app.getHttpServer())
				.get('/api/v1/status/did:iota:12345')
				.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435');
			expect(status).toBe(200);
			expect(text).toBe('created');
		});

		it('/:id (GET): no slu-status found ', async () => {
			const { status, body } = await request(app.getHttpServer())
				.get('/api/v1/status/did:iota:1234')
				.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435');
			expect(status).toBe(200);
			expect(body).toEqual({});
		});

		it('/:id (GET): wrong api-key', async () => {
			const { status, body } = await request(app.getHttpServer())
				.get('/api/v1/status/did:iota:12345')
				.set('X-API-KEY', '3b3fe07d-b7db-49cb-8300-d32139e3d435');
			expect(status).toBe(400);
			expect(body).toBe('No valid api-key provided');
		});

		it('/:id (GET):no api-key', async () => {
			const { status, body } = await request(app.getHttpServer()).get('/api/v1/status/did:iota:12345');
			expect(status).toBe(400);
			expect(body).toBe('No valid api-key provided');
		});

		it('POST', async () => {
			await sluStatusModel.deleteMany();
			const { status, body } = await request(app.getHttpServer())
				.post('/api/v1/status')
				.send(sluStatus)
				.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435');
			delete body._id;
			expect(status).toBe(201);
			expect(body).toEqual(sluStatus);
		});

		it('POST: duplicate key (Internal server error)', async () => {
			await sluStatusModel.deleteMany();
			await new sluStatusModel(sluStatus).save();
			const { status, body } = await request(app.getHttpServer())
				.post('/api/v1/status')
				.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435')
				.send(sluStatus);
			expect(status).toBe(500);
			expect(body.message).toBe('Internal server error');
		});

		it('POST: wrong status', async () => {
			await sluStatusModel.deleteMany();
			const wrongSluStatus = {
				id: 'did:iota:12345',
				status: 'destroyed',
				channelAddress: 'anyKindOfAddress'
			};
			const { body } = await request(app.getHttpServer())
				.post('/api/v1/status')
				.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435')
				.send(wrongSluStatus);

			expect(body.statusCode).toBe(400);
			expect(body.message).toBe('Validation fails for status: destroyed');
			expect(body.error).toBe('Bad Request');
		});

		it('POST: wrong id', async () => {
			const wrongSluStatus = {
				id: 'dd:iota:12345',
				status: 'installed',
				channelAddress: 'anyKindOfAddress'
			};
			const { body } = await request(app.getHttpServer())
				.post('/api/v1/status')
				.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435')
				.send(wrongSluStatus);

			expect(body.statusCode).toBe(400);
			expect(body.message).toBe('Validation fails for status: dd:iota:12345');
			expect(body.error).toBe('Bad Request');
		});

		it('POST: wrong api-key', async () => {
			const { status, body } = await request(app.getHttpServer())
				.post('/api/v1/status')
				.set('X-API-KEY', '3b3fe07d-b7db-49cb-8300-d32139e3d435')
				.send(sluStatus);
			expect(status).toBe(400);
			expect(body).toBe('No valid api-key provided');
		});

		it('POST:no api-key', async () => {
			const { status, body } = await request(app.getHttpServer()).post('/api/v1/status').send(sluStatus);
			expect(status).toBe(400);
			expect(body).toBe('No valid api-key provided');
		});

		it('/:id/:status (PUT)', async () => {
			await sluStatusModel.deleteMany();
			await new sluStatusModel(sluStatus).save();
			const { status, body } = await request(app.getHttpServer())
				.put('/api/v1/status/did:iota:12345/' + Status.INSTALLED)
				.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435');
			expect(status).toBe(200);
			expect(body.status).toBe(Status.INSTALLED);
			expect(body.id).toBe(sluStatus.id);
		});
		it('/:id/:status (PUT): validation of status fails', async () => {
			const { status, body } = await request(app.getHttpServer())
				.put('/api/v1/status/did:iota:12345/destroyed')
				.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435');
			expect(status).toBe(400);
			expect(body.message).toBe('Validation failed (enum string is expected)');
			expect(body.error).toBe('Bad Request');
		});

		it('/:id/:status (PUT): no entry for the provided id', async () => {
			const { status, body } = await request(app.getHttpServer())
				.put('/api/v1/status/did:iota:1345/installed')
				.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435');
			expect(status).toBe(200);
			expect(body).toEqual({});
		});

		it('/:id/:status (PUT): wrong api-key', async () => {
			const { status, body } = await request(app.getHttpServer())
				.put('/api/v1/status/did:iota:1345/installed')
				.set('X-API-KEY', '3b3fe07d-b7db-49cb-8300-d32139e3d435');
			expect(status).toBe(400);
			expect(body).toBe('No valid api-key provided');
		});

		it('/:id/:status (PUT):no api-key', async () => {
			const { status, body } = await request(app.getHttpServer()).put('/api/v1/status/did:iota:1345/installed');
			expect(status).toBe(400);
			expect(body).toBe('No valid api-key provided');
		});
	});

	describe('/api/v1/slu-nonce', () => {
		const sluNonceDto = {
			sluId: 'did:iota:Fis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF',
			nonce: '28803921-d885-4eb2-8763-30098bb15466',
			creator: 'did:iota:Cis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF'
		};
		it('POST', async () => {
			const { status, body } = await request(app.getHttpServer())
				.post('/api/v1/slu-nonce')
				.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435')
				.send(sluNonceDto);

			expect(status).toBe(201);
			expect(body).toEqual(sluNonceDto);
		});

		it('POST: wrong did', async () => {
			const wrongSluNonceDto = {
				sluId: 'dd:iota:Fis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF',
				nonce: '28803921-d885-4eb2-8763-30098bb15466',
				creator: 'did:iota:Cis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF'
			};
			const { body } = await request(app.getHttpServer())
				.post('/api/v1/slu-nonce')
				.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435')
				.send(wrongSluNonceDto);

			expect(body.statusCode).toBe(400);
			expect(body.message[0]).toBe('wrong DID format');
			expect(body.error).toBe('Bad Request');
		});

		it('POST: no api-key', async () => {
			const wrongSluNonceDto = {
				sluId: 'dd:iota:Fis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF',
				nonce: '28803921-d885-4eb2-8763-30098bb15466',
				creator: 'did:iota:Cis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF'
			};
			const { status, body } = await request(app.getHttpServer()).post('/api/v1/slu-nonce').send(wrongSluNonceDto);

			expect(status).toBe(400);
			expect(body).toBe('No valid api-key provided');
		});

		it('/:id/:creator (GET)', async () => {
			const { status, body } = await request(app.getHttpServer())
				.get(
					'/api/v1/slu-nonce/did:iota:Fis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF/did:iota:Cis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF'
				)
				.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435');

			expect(status).toBe(200);
			expect(body).toEqual(sluNonceDto);
		});

		it('/:id/:creator (DELETE)', async () => {
			const { status, body } = await request(app.getHttpServer())
				.delete(
					'/api/v1/slu-nonce/did:iota:Fis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF/did:iota:Cis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF'
				)
				.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435');

			expect(status).toBe(200);
			expect(body).toEqual({ acknowledged: true, deletedCount: 1 });
		});

		it('/:creator (POST)', async () => {
			await sluNonceModel.deleteMany();
			const sluNonceDto = {
				sluId: 'did:iota:Kis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF',
				nonce: '38803921-d885-4eb2-8763-30098bb15466',
				creator: 'did:iota:Cis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF'
			};
			await new sluNonceModel(sluNonceDto).save();
			await new sluNonceModel({ sluId: 'did:iota:Fis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF', ...sluNonceDto }).save();
			await new sluNonceModel({
				sluId: 'did:iota:Pis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF',
				creator: 'did:iota:Vis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF',
				...sluNonceDto
			}).save();

			const postBody = {
				sluIds: [
					'did:iota:Kis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF',
					'did:iota:Fis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF',
					'did:iota:Pis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF'
				]
			};

			const responseBody = [
				{
					sluId: 'did:iota:Kis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF',
					nonce: '38803921-d885-4eb2-8763-30098bb15466',
					creator: 'did:iota:Cis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF'
				},
				{
					sluId: 'did:iota:Fis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF',
					nonce: '38803921-d885-4eb2-8763-30098bb15466',
					creator: 'did:iota:Cis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF'
				},
				{
					sluId: 'did:iota:Pis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF',
					nonce: '',
					creator: 'did:iota:Cis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF'
				}
			];

			const { status, body } = await request(app.getHttpServer())
				.post('/api/v1/slu-nonce/did:iota:Cis67T817snkcQqbH8kMCekjVRKhzP2zTcvxxBFPeRRF')
				.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435')
				.send(postBody);

			expect(status).toBe(201);
			expect(body.toString()).toMatch(responseBody.toString());
		});
	});

	afterAll(async () => {
		await sluStatusModel.deleteMany();
		await connection.close();
		if (mongod) await mongod.stop();
	});
});
