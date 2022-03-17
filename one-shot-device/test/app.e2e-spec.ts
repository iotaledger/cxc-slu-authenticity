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
import { authorizedChannelMock } from './../src/devices/mocks';
import { MongoMemoryServer } from 'mongodb-memory-server';

jest.setTimeout(40000);

describe('AppController (e2e)', () => {
	let app: INestApplication;
	let deviceRegistrationModel: Model<DeviceRegistrationDocument>;
	let httpService: HttpService;
	let httpServer;
	let mongod: MongoMemoryServer;
	let savedDeviceExample;

	const createDevice: dto | any = {
		nonce: deviceStubData().nonce,
		channelId: deviceStubData().subscriptionLink,
		channelSeed: deviceStubData().channelSeed,
		identityKeys: deviceStubData().identityKeys
	};

	const nonce = '1b0e4a49-3a23-4e7e-99f4-97fda845ff02';

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				AppModule,
				ConfigModule,
				HttpModule,
				MongooseModule.forRootAsync({
					useFactory: async () => {
						mongod = await MongoMemoryServer.create({
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

		await deviceRegistrationModel.deleteMany();
		savedDeviceExample = await deviceRegistrationModel.create(createDevice);
	});

	afterAll(async () => {
		app.close();
	});

	it('/create (POST) it should create channel, device identity and nonce', async () => {
		jest.spyOn(httpService, 'post').mockReturnValue(createDevice);
		const response = await request(httpServer).post(`/create/:${authorizedChannelMock}`).send(createDevice);
		console.log('response: ', response);
		expect(response.status).toBe(201);

		const savedDevice = await deviceRegistrationModel.findOne({ nonce }, { _id: 0 });
		expect(savedDevice.nonce).toStrictEqual(createDevice.nonce);
	});

	it('/:nonce (GET) it should return device to the creator and remove the document from the collection', async () => {
		jest.spyOn(httpService, 'get');
		const response = await request(httpServer).get(`/bootstrap/${nonce}`);
		const bootstrapNonceResult = {
			success: true,
			registeredDeviceInfo: savedDeviceExample
		};

		expect(response.status).toBe(200);
		expect(response.body).toStrictEqual(JSON.parse(JSON.stringify(bootstrapNonceResult)));

		const findDevice = await deviceRegistrationModel.findOne({ nonce });
		expect(findDevice).toBe(null);
	});
});
