import { DeviceRegistrationController } from './device-registration.controller';
import { DeviceRegistrationService } from './device-registration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { DeviceRegistration, DeviceRegistrationDocument, DeviceRegistrationSchema } from './schemas/device-registration.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { HttpModule } from '@nestjs/axios';

describe('DeviceRegistrationController', () => {
	let deviceRegistrationController: DeviceRegistrationController;
	let deviceRegistrationService: DeviceRegistrationService;
	let deviceRegistrationModel: Model<DeviceRegistrationDocument>;
	let connection: Connection;
	let mongod: MongoMemoryServer;

	beforeEach(async () => {
		const moduleReference: TestingModule = await Test.createTestingModule({
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

		// deviceRegistrationService = await moduleReference.resolve(DeviceRegistrationService);
		deviceRegistrationService = moduleReference.get<DeviceRegistrationService>(DeviceRegistrationService);
		deviceRegistrationController = await moduleReference.get<DeviceRegistrationController>(DeviceRegistrationController);
		connection = await moduleReference.get(getConnectionToken());
	});

	it('should be defined', () => {
		expect(deviceRegistrationController).toBeDefined();
	});

	// Test Post route:
	// it('should create channel and identity registration with device nonce to MongoDb', () => {
	// 	// controller test for @Post()
	// });

	afterEach(() => {
		async (done) => {
			if (mongod) await mongod.stop();
			await connection.close(true);
			done();
		};
	});
}); // describe block ends here
