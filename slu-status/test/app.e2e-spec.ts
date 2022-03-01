import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SluStatus, SluStatusSchema } from '../src/slu-status/schema/slu-status.schema';
import { Model, Connection } from 'mongoose';
import { Status } from '../src/slu-status/model/Status';

describe('AppController (e2e)', () => {
	let app: INestApplication;
	let mongod: MongoMemoryServer;
	let sluStatusModel: Model<SluStatus>;
	let connection: Connection;
	let sluStatus: SluStatus;

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
				MongooseModule.forFeature([{ name: SluStatus.name, schema: SluStatusSchema }])
			]
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
		sluStatusModel = moduleFixture.get<Model<SluStatus>>(getModelToken(SluStatus.name));
		connection = moduleFixture.get<Connection>(getConnectionToken());

		await sluStatusModel.deleteMany();

		sluStatus = {
			id: 'did:iota:12345',
			status: Status.CREATED,
			channelAddress: 'anyKindOfAddress'
		};
	});

	it('/status/:id (GET)', async () => {
		await new sluStatusModel(sluStatus).save();
		const { status, text } = await request(app.getHttpServer())
			.get('/status/did:iota:12345')
			.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435');
		expect(status).toBe(200);
		expect(text).toBe('created');
	});

	it('/status/:id (GET): no slu-status found ', async () => {
		const { status, body } = await request(app.getHttpServer())
			.get('/status/did:iota:1234')
			.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435');
		expect(status).toBe(200);
		expect(body).toEqual({});
	});

	it('/status/:id (GET): wrong api-key', async () => {
		const { status, body } = await request(app.getHttpServer())
			.get('/status/did:iota:12345')
			.set('X-API-KEY', '3b3fe07d-b7db-49cb-8300-d32139e3d435');
		expect(status).toBe(400);
		expect(body[0]).toBe('No valid api-key provided');
	});

	it('/status/:id (GET):no api-key', async () => {
		const { status, body } = await request(app.getHttpServer()).get('/status/did:iota:12345');
		expect(status).toBe(400);
		expect(body[0]).toBe('No valid api-key provided');
	});

	it('/status/ (POST)', async () => {
		await sluStatusModel.deleteMany();
		const { status, body } = await request(app.getHttpServer())
			.post('/status')
			.send(sluStatus)
			.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435');
		delete body._id;
		expect(status).toBe(201);
		expect(body).toEqual(sluStatus);
	});

	it('/status/ (POST): duplicate key (Internal server error)', async () => {
		await sluStatusModel.deleteMany();
		await new sluStatusModel(sluStatus).save();
		const { status, body } = await request(app.getHttpServer())
			.post('/status')
			.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435')
			.send(sluStatus);
		expect(status).toBe(500);
		expect(body.message).toBe('Internal server error');
	});

	it('/status/ (POST): wrong status', async () => {
		await sluStatusModel.deleteMany();
		const wrongSluStatus = {
			id: 'did:iota:12345',
			status: 'destroyed',
			channelAddress: 'anyKindOfAddress'
		};
		const { body } = await request(app.getHttpServer())
			.post('/status')
			.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435')
			.send(wrongSluStatus);
		expect(body.statusCode).toBe(400);
		expect(body.message).toBe('Validation fails for status: destroyed');
		expect(body.error).toBe('Bad Request');
	});

	it('/status/ (POST): wrong id', async () => {
		const wrongSluStatus = {
			id: 'dd:iota:12345',
			status: 'destroyed',
			channelAddress: 'anyKindOfAddress'
		};
		const { body } = await request(app.getHttpServer())
			.post('/status')
			.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435')
			.send(wrongSluStatus);
		expect(body.statusCode).toBe(400);
		expect(body.message[0].value).toBe('dd:iota:12345');
		expect(body.error).toBe('Bad Request');
	});

	it('/status (POST): wrong api-key', async () => {
		const { status, body } = await request(app.getHttpServer())
			.post('/status')
			.set('X-API-KEY', '3b3fe07d-b7db-49cb-8300-d32139e3d435')
			.send(sluStatus);
		expect(status).toBe(400);
		expect(body[0]).toBe('No valid api-key provided');
	});

	it('/status (POST):no api-key', async () => {
		const { status, body } = await request(app.getHttpServer()).post('/status').send(sluStatus);
		expect(status).toBe(400);
		expect(body[0]).toBe('No valid api-key provided');
	});

	it('/status (PUT)', async () => {
		await new sluStatusModel(sluStatus).save();
		const { status, body } = await request(app.getHttpServer())
			.put('/status/did:iota:12345/' + Status.INSTALLED)
			.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435');
		expect(status).toBe(200);
		expect(body.status).toBe(Status.INSTALLED);
		expect(body.id).toBe(sluStatus.id);
	});
	it('/status (PUT): validation of status fails', async () => {
		const { status, body } = await request(app.getHttpServer())
			.put('/status/did:iota:12345/destroyed')
			.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435');
		expect(status).toBe(400);
		expect(body.message).toBe('Validation failed (enum string is expected)');
		expect(body.error).toBe('Bad Request');
	});

	it('/status (PUT): no entry for the provided id', async () => {
		const { status, body } = await request(app.getHttpServer())
			.put('/status/did:iota:1345/installed')
			.set('X-API-KEY', '2b3fe07d-b7db-49cb-8300-d32139e3d435');
		expect(status).toBe(200);
		expect(body).toEqual({});
	});

	it('/status (PUT): wrong api-key', async () => {
		const { status, body } = await request(app.getHttpServer())
			.put('/status/did:iota:1345/installed')
			.set('X-API-KEY', '3b3fe07d-b7db-49cb-8300-d32139e3d435');
		expect(status).toBe(400);
		expect(body[0]).toBe('No valid api-key provided');
	});

	it('/status (PUT):no api-key', async () => {
		const { status, body } = await request(app.getHttpServer()).put('/status/did:iota:1345/installed');
		expect(status).toBe(400);
		expect(body[0]).toBe('No valid api-key provided');
	});

	afterAll(async () => {
		await sluStatusModel.deleteMany();
		await connection.close();
		if (mongod) await mongod.stop();
	});
});
