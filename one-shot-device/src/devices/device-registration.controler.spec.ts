import { DeviceRegistrationController } from './device-registration.controller';
import { DeviceRegistrationService } from './device-registration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceRegistration, DeviceRegistrationDocument, DeviceRegistrationSchema } from './schemas/device-registration.schema';
import { CreateDeviceRegistrationDto as dto } from './dto/create-device-registration.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

jest.setTimeout(30000);
describe('DeviceRegistrationController', () => {
	let deviceRegistrationController: DeviceRegistrationController;
	let deviceRegistrationService: DeviceRegistrationService;
	let deviceRegistrationModel: Model<DeviceRegistrationDocument>;
	let module: TestingModule;

	const mockData: dto | any = {
		identityKeys: {
			id: 'did:iota:5qmWjFWcqE3BNTB9KNCBH6reXEgig4gFUXiPENywB3wo',
			key: {
				type: 'ed25519',
				public: 'BKU1cLqakKrN9g4ridQ6z5NyHqA7vZLLqmAygwDrSeex',
				secret: '9EXX7aqBKGpBBDvy7ND65PvHe2DHwZrq7ZLorzE8ZDvv',
				encoding: 'base58'
			}
		},
		channelSeed: 'jldirikybrxczxlhhswzikqhsafjdzejjacoqaymzmoffdrwrzmytolrwuyhwoweybnzofew',
		channelId: 'f48875646434e9b12019d2290bd74f0f4eae8393ada3b503202dfc713f0323070000000000000000:3cce98eb1742468ff35fde6b',
		nonce: '1b0e4a49-3a23-4e7e-99f4-97fda845ff02'
	};

	const requestMock = {
		query: {}
	} as unknown as Request;

	const responseMock = {
		status: jest.fn((x) => ({ send: jest.fn((y) => y) })),
		send: jest.fn((x) => x)
	} as unknown as Response;

	function mockUserModel(dto) {
		this.data = dto;
		this.save = () => {
			return this.data;
		};
	}

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

	it('deviceRegistrationService should be defined', () => {
		expect(deviceRegistrationService).toBeDefined();
	});

	// // Test Post route:`
	it('post route should return status 201: ', async () => {
		// const post = jest.spyOn(deviceRegistrationController, 'createChannelAndIdentity').mockReturnValueOnce(responseMock);
		const postRoute = await deviceRegistrationController.createChannelAndIdentity();
		console.log('postRoute', postRoute);
		expect(postRoute.success).toBe(true);
	});
	it('should save nonce, channel and device identity to MongoDb', () => {
		const saveData = jest.spyOn(deviceRegistrationService, 'createChannelAndIdentity').mockResolvedValue();
		expect(saveData).toBe(mockData);
	});

	afterEach(() => {
		module.close();
	});
}); // describe block ends here
