import { DeviceRegistrationController } from './device-registration.controller';
import { DeviceRegistrationService } from './device-registration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceRegistration, DeviceRegistrationDocument, DeviceRegistrationSchema } from './schemas/device-registration.schema';
import { CreateDeviceRegistrationDto as dto } from './dto/create-device-registration.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { mockDeviceRegistration } from './mocks';

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

	it('deviceRegistrationService should be defined', () => {
		expect(deviceRegistrationService).toBeDefined();
	});

	it('should create channel', async () => {
		// const channel = jest.spyOn(deviceRegistrationService, 'createChannelAndIdentity');
	});

	it('should create Identity', async () => {
		// const identity = jest.spyOn(deviceRegistrationService, 'createChannelAndIdentity');
	});

	it('should authenticate the device', async () => {
		// const identity = jest.spyOn(deviceRegistrationService, 'createChannelAndIdentity');
	});
}); // describe block end here
