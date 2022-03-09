import { DeviceRegistrationController } from './device-registration.controller';
import { DeviceRegistrationService } from './device-registration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule, getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { DeviceRegistration, DeviceRegistrationSchema, DeviceRegistrationDocument } from './schemas/device-registration.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { channelMock, identityMock, mockDeviceRegistration, nonceMock } from './mocks';
import { ChannelClient, IdentityClient } from 'iota-is-sdk';
import { Connection, Model } from 'mongoose';

describe('DeviceRegistrationController', () => {
	let deviceRegistrationController: DeviceRegistrationController;
	let deviceRegistrationService: DeviceRegistrationService;
	let deviceRegistrationModel: Model<DeviceRegistrationDocument>;
	let module: TestingModule;
	let mongod: MongoMemoryServer;
	let connection: Connection;

	afterEach(() => {
		module.close();
	});

	beforeEach(async () => {
		module = await Test.createTestingModule({
			imports: [
				HttpModule,
				ConfigModule,
				ChannelClient,
				IdentityClient,
				MongooseModule.forRootAsync({
					useFactory: async () => {
						mongod = await MongoMemoryServer.create();
						const uri = mongod.getUri();
						return {
							uri: uri
						};
					}
				}),
				MongooseModule.forFeature([{ name: DeviceRegistration.name, schema: DeviceRegistrationSchema }])
			],
			controllers: [DeviceRegistrationController],
			providers: [
				DeviceRegistrationService,
				ConfigService,
				{
					provide: 'ChannelClient',
					useValue: {
						create: () => channelMock,
						authenticate: () => {
							identityMock.doc.id, identityMock.key.secret;
						}
					}
				},
				{
					provide: 'IdentityClient',
					useValue: {
						create: () => identityMock
					}
				}
			]
		}).compile();

		deviceRegistrationService = module.get<DeviceRegistrationService>(DeviceRegistrationService);
		deviceRegistrationController = module.get<DeviceRegistrationController>(DeviceRegistrationController);
		deviceRegistrationModel = module.get<Model<DeviceRegistrationDocument>>(getModelToken(DeviceRegistration.name));
		connection = module.get<Connection>(getConnectionToken());
	});

	it('deviceRegistrationController should be defined', () => {
		expect(deviceRegistrationController).toBeDefined();
	});

	it('post route should return success true', async () => {
		const result = await deviceRegistrationController.createChannelAndIdentity();
		console.log('controller result: ', result);
		expect(result.success).toBe(true);
	});

	it('should save nonce, channel and device identity to MongoDb', async () => {
		jest.spyOn(deviceRegistrationService, 'createChannelAndIdentity').mockResolvedValue(mockDeviceRegistration);
		const saveDeviceToDb = await deviceRegistrationController.createChannelAndIdentity();
		expect(saveDeviceToDb.registerDevice).toBe(mockDeviceRegistration);
	});

	it('should delete the device from slu-bootstrap collection ', async () => {
		jest.spyOn(deviceRegistrationService, 'getRegisteredDevice').mock;
		const saveDeviceToDb = await deviceRegistrationModel.create(mockDeviceRegistration);
		const deleteDeviceFromCollection = await deviceRegistrationController.getRegisteredDevice(nonceMock);
		expect(deleteDeviceFromCollection.registeredDeviceInfo.nonce).toBe(saveDeviceToDb.nonce);
	});

	afterEach(async () => {
		await connection.close();
		if (mongod) mongod.stop();
	});
});
