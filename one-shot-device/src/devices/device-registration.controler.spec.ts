import { DeviceRegistrationController } from './device-registration.controller';
import { DeviceRegistrationService } from './device-registration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceRegistration, DeviceRegistrationSchema } from './schemas/device-registration.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { mockDeviceRegistration, nonceMock } from './mocks';

jest.setTimeout(40000);
describe('DeviceRegistrationController', () => {
	let deviceRegistrationController: DeviceRegistrationController;
	let deviceRegistrationService: DeviceRegistrationService;
	let module: TestingModule;

	afterEach(() => {
		module.close();
	});

	beforeEach(async () => {
		module = await Test.createTestingModule({
			imports: [
				HttpModule,
				ConfigModule,
				MongooseModule.forRootAsync({
					useFactory: async () => {
						const mongod = await MongoMemoryServer.create();
						const uri = await mongod.getUri();
						return {
							uri: uri
						};
					}
				}),
				MongooseModule.forFeature([{ name: DeviceRegistration.name, schema: DeviceRegistrationSchema }])
			],
			controllers: [DeviceRegistrationController],
			providers: [DeviceRegistrationService, ConfigService]
		}).compile();

		deviceRegistrationService = await module.get<DeviceRegistrationService>(DeviceRegistrationService);
		deviceRegistrationController = await module.get<DeviceRegistrationController>(DeviceRegistrationController);
	});

	it('deviceRegistrationController should be defined', () => {
		expect(deviceRegistrationController).toBeDefined();
	});

	it('post route should return status 201: ', async () => {
		const postRoute = await deviceRegistrationController.createChannelAndIdentity();
		expect(postRoute.success).toBe(true);
	});

	it('should save nonce, channel and device identity to MongoDb', async () => {
		jest.spyOn(deviceRegistrationService, 'createChannelAndIdentity').mockResolvedValue(mockDeviceRegistration);
		const saveDeviceToDb = await deviceRegistrationController.createChannelAndIdentity();
		expect(saveDeviceToDb.registerDevice).toBe(mockDeviceRegistration);
	});

	it('should delete the device from slu-bootstrap collection ', async () => {
		jest.spyOn(deviceRegistrationService, 'createChannelAndIdentity').mockResolvedValue(mockDeviceRegistration);
		jest.spyOn(deviceRegistrationService, 'getRegisteredDevice').mock;
		const deleteDeviceFromCollection = await deviceRegistrationController.getRegisteredDevice(nonceMock);
		expect(deleteDeviceFromCollection.registeredDeviceInfo).toBe(null);
	});
});
