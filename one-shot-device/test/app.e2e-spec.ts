import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpService, HttpModule } from '@nestjs/axios';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
	DeviceRegistration,
	DeviceRegistrationDocument,
	DeviceRegistrationSchema
} from '../../one-shot-device/src/devices/schemas/device-registration.schema';
import { CreateDeviceRegistrationDto as dto } from '../src/devices/dto/create-device-registration.dto';
import { deviceStubData } from './stubs/device.stubs';
import { MongoMemoryServer } from 'mongodb-memory-server';

jest.setTimeout(40000);

describe('AppController (e2e)', () => {
	let app: INestApplication;
	let deviceRegistrationModel: Model<DeviceRegistrationDocument>;
	let httpService: HttpService;
	let httpServer;
	let mongod: MongoMemoryServer;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				AppModule,
				ConfigModule,
				HttpModule,
				MongooseModule.forRootAsync({
					useFactory: async () => {
						const mongod = await MongoMemoryServer.create({
							instance: {
								port: 8088
							}
						});
						const uri = await mongod.getUri();
						return {
							uri: uri
						};
					}
				}),
				MongooseModule.forFeature([{ name: DeviceRegistration.name, schema: DeviceRegistrationSchema }])
			],
			providers: [ConfigService]
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		deviceRegistrationModel = moduleFixture.get<Model<DeviceRegistrationDocument>>(getModelToken(DeviceRegistration.name));
		httpService = moduleFixture.get<HttpService>(HttpService);
		httpServer = app.getHttpServer();
	});

	afterAll(async () => {
		app.close();
	});

	it('/create (POST) it should create channel, device identity and nonce', async () => {
		const createDevice: dto | any = {
			nonce: deviceStubData().nonce,
			channelId: deviceStubData().channelId,
			channelSeed: deviceStubData().channelSeed,
			identityKeys: deviceStubData().identityKeys
		};
		console.log(createDevice);

		jest.spyOn(httpService, 'post').mockReturnValue(createDevice);
		const response = await request(httpServer).post('/create').send(createDevice);

		expect(response.status).toBe(201);
		// expect(response.body).toMatchObject(createDevice);

		const savedDevice = await deviceRegistrationModel.findOne({ nonce: '1b0e4a49-3a23-4e7e-99f4-97fda845ff02' }, { _id: 0 });
		console.log('savedDevice:', savedDevice);
		expect(savedDevice).toMatchObject(createDevice);
	});
});
