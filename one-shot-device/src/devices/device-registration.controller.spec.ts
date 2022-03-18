import { DeviceRegistrationController } from './device-registration.controller';
import { DeviceRegistrationService } from './device-registration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule, getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { DeviceRegistration, DeviceRegistrationSchema, DeviceRegistrationDocument } from './schemas/device-registration.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { channelMock, identityMock, mockDeviceRegistration, nonceMock, authorizedChannelMock } from './mocks';
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
					provide: 'UserClient',
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

	it('should save nonce, channel and device identity to MongoDb', async () => {
		jest
			.spyOn(deviceRegistrationService, 'createIdentityAndSubscribe')
			.mockResolvedValue({ nonce: nonceMock, id: 'did:iota:123', channelAddress: authorizedChannelMock });
		const saveDeviceToDb = (await deviceRegistrationController.createAndSubscribe(authorizedChannelMock)) as { nonce: string };
		expect(saveDeviceToDb.nonce).toBe(nonceMock);
	});

	it('should delete the device from slu-bootstrap collection ', async () => {
		const updateSluStatusSpy = jest.spyOn(deviceRegistrationService, 'updateSluStatus').mockImplementation();
		const saveDeviceToDb = await (await deviceRegistrationModel.create(mockDeviceRegistration)).save();

		const deleteDeviceFromCollection = (await deviceRegistrationController.getRegisteredDevice(
			mockDeviceRegistration.nonce
		)) as DeviceRegistration;

		expect(updateSluStatusSpy).toHaveBeenCalledWith(saveDeviceToDb.identityKeys.id);
		expect(deleteDeviceFromCollection.nonce).toBe(saveDeviceToDb.nonce);
		expect(deleteDeviceFromCollection.channelId).toBe(saveDeviceToDb.channelId);
		expect(deleteDeviceFromCollection.channelSeed).toBe(saveDeviceToDb.channelSeed);
		expect(deleteDeviceFromCollection.identityKeys).toEqual(saveDeviceToDb.identityKeys);
		expect(deleteDeviceFromCollection.subscriptionLink).toBe(saveDeviceToDb.subscriptionLink);
	});

	afterEach(async () => {
		await connection.close();
		if (mongod) mongod.stop();
	});
});
