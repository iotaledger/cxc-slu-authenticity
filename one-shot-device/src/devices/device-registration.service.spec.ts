import { DeviceRegistrationController } from './device-registration.controller';
import { DeviceRegistrationService } from './device-registration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { DeviceRegistration, DeviceRegistrationDocument, DeviceRegistrationSchema } from './schemas/device-registration.schema';
import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { mockDeviceRegistration, nonceMock, mockFaultyDeviceRegistrationObject, badNonceMock } from './mocks';

jest.setTimeout(40000);
describe('DeviceRegistrationController', () => {
	let deviceRegistrationService: DeviceRegistrationService;
	let deviceRegistrationModel: Model<DeviceRegistrationDocument>;
	let module: TestingModule;

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
		deviceRegistrationModel = module.get<Model<DeviceRegistrationDocument>>(getModelToken(DeviceRegistration.name));
	});

	afterAll(async () => {
		module.close();
	});

	it('deviceRegistrationService should be defined', () => {
		expect(deviceRegistrationService).toBeDefined();
	});

	it('should validate the DTO and save device identity to MongoDB', async () => {
		jest.spyOn(deviceRegistrationService, 'createChannelAndIdentity');
		await deviceRegistrationModel.create(mockDeviceRegistration);
		const savedDevice = await deviceRegistrationModel.find({ nonceMock });
		expect(savedDevice[0]).toMatchObject(mockDeviceRegistration);
	});

	// test the public methods
	// 	createChannelAndIdentity
	// Should return an error during creation of an identity and return the error
	// Should return an error during creation of a channel  and return the error
	// Successfully create the identity and channel
	// it('Should return an error during creation of an identity and return the error', async () => {
	// 	jest.spyOn(deviceRegistrationService, 'createChannelAndIdentity');
	// 	try {
	// 		const createIdentity = await deviceRegistrationService.createChannelAndIdentity();
	// 	} catch (err) {
	// 		expect(err.message).toBe('DeviceRegistration validation failed: nonce: Path `nonce` is required.');
	// 	}
	// });

	it('should not validate an faulty data structure', async () => {
		jest.spyOn(deviceRegistrationService, 'createChannelAndIdentity');
		try {
			await deviceRegistrationModel.create(mockFaultyDeviceRegistrationObject);
		} catch (err) {
			expect(err.message).toBe('DeviceRegistration validation failed: nonce: Path `nonce` is required.');
		}
	});

	it('should fail to remove device when provided with non existing nonce', async () => {
		jest.spyOn(deviceRegistrationService, 'getRegisteredDevice');
		try {
			await deviceRegistrationModel.create(mockDeviceRegistration);
			deviceRegistrationModel.findOneAndDelete({ badNonceMock }).exec;
		} catch (err) {
			expect(err.message).toBe('Document does not exist in the collection');
		}
	});
});
