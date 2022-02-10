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
		deviceRegistrationModel = module.get<Model<DeviceRegistrationDocument>>(getModelToken(DeviceRegistration.name));
	});

	it('deviceRegistrationService should be defined', () => {
		expect(deviceRegistrationService).toBeDefined();
	});

	it('It should validate the DTO and save device identity to MongoDB', async () => {
		jest.spyOn(deviceRegistrationService, 'createChannelAndIdentity');
		await deviceRegistrationModel.create(mockDeviceRegistration);
		const savedDevice = await deviceRegistrationModel.find({ nonceMock });
		expect(savedDevice[0]).toMatchObject(mockDeviceRegistration);
	});

	it('should not validate an faulty data structure', async () => {
		jest.spyOn(deviceRegistrationService, 'createChannelAndIdentity');
		try {
			await deviceRegistrationModel.create(mockFaultyDeviceRegistrationObject);
		} catch (err) {
			expect(err.message).toBe('DeviceRegistration validation failed: nonce: Path `nonce` is required.');
		}
	});

	// it('should fail to remove device when provided with non existing nonce', async () => {
	// 	jest.spyOn(deviceRegistrationService, 'getRegisteredDevice');
	// 	try {
	// 		await deviceRegistrationModel.create(mockDeviceRegistration);
	// 		const deleteOperation = deviceRegistrationModel.findOneAndDelete({ badNonceMock }).exec;
	// 		if (deleteOperation === null) {

	// 		}
	// 	} catch (err) {
	// 		expect(err.message).toBe('DeviceRegistration validation failed: nonce: Path `nonce` is required.');
	// 	}
	// });
});
