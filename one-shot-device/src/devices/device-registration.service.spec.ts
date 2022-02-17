import { DeviceRegistrationController } from './device-registration.controller';
import { DeviceRegistrationService } from './device-registration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { DeviceRegistration, DeviceRegistrationDocument, DeviceRegistrationSchema } from './schemas/device-registration.schema';
import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { mockDeviceRegistration, mockFaultyDeviceRegistrationObject, badNonceMock, identityMock, channelMock } from './mocks';
import { CreateChannelResponse } from '../../node_modules/iota-is-sdk/lib/models/types/request-response-bodies';
import { IdentityJson } from '../../node_modules/iota-is-sdk/lib/models/types/identity';

jest.setTimeout(40000);

describe('DeviceRegistrationController', () => {
	let deviceRegistrationService: DeviceRegistrationService;
	let deviceRegistrationModel: Model<DeviceRegistrationDocument>;
	let module: TestingModule;

	const moduleCreator = async (identityClientMock: IdentityJson | any, channelClientMock: CreateChannelResponse | any) => {
		module = await Test.createTestingModule({
			imports: [
				HttpModule,
				ConfigModule,
				MongooseModule.forRootAsync({
					useFactory: async () => {
						const mongod = await MongoMemoryServer.create();
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
					useValue: channelClientMock
				},
				{
					provide: 'IdentityClient',
					useValue: identityClientMock
				}
			]
		}).compile();

		deviceRegistrationService = module.get<DeviceRegistrationService>(DeviceRegistrationService);
		deviceRegistrationModel = module.get<Model<DeviceRegistrationDocument>>(getModelToken(DeviceRegistration.name));
	};

	fit('deviceRegistrationService should be defined', async () => {
		await moduleCreator(identityMock, channelMock);
		expect(deviceRegistrationService).toBeDefined();
	});

	fit('deviceRegistrationService should return nonce and created a device and a channel', async () => {
		await moduleCreator(
			{
				create: () => identityMock
			},
			{
				create: () => channelMock,
				authenticate: () => {
					identityMock.doc.id, identityMock.key.secret;
				}
			}
		);
		const result = await deviceRegistrationService.createChannelAndIdentity();
		console.log('fit result: ', result);
		// we cant check for the exact nonce since it is a dynamic string
		expect(result.nonce).not.toBeNull();
		expect(result.nonce.length).toEqual(36);
	});

	fit('deviceRegistrationService should return error for a null channel value', async () => {
		await moduleCreator(
			{
				create: () => identityMock
			},
			{
				create: () => null,
				authenticate: () => {
					identityMock.doc.id, identityMock.key.secret;
				}
			}
		);
		try {
			await deviceRegistrationService.createChannelAndIdentity();
		} catch (err) {
			expect(err.message).toBe('Could not create the channel.');
		}
	});

	fit('deviceRegistrationService should return error for a null identity value', async () => {
		await moduleCreator(
			{
				create: () => null
			},
			{
				create: () => channelMock,
				authenticate: () => {
					identityMock.doc.id, identityMock.key.secret;
				}
			}
		);
		try {
			await deviceRegistrationService.createChannelAndIdentity();
		} catch (err) {
			expect(err.message).toBe('Could not create the device identity.');
		}
	});

	// nonce with this setup is dynamic??
	// fit('should validate the DTO and save device identity to MongoDB', async () => {
	// 	jest.spyOn(deviceRegistrationService, 'createChannelAndIdentity');
	// 	const createMongoDocument = deviceRegistrationService.createChannelAndIdentity();
	// 	console.log('createMongoDocument: ', createMongoDocument);
	// 	// await deviceRegistrationModel.create(mockDeviceRegistration);
	// 	const savedDevice = await deviceRegistrationModel.find({});
	// 	console.log('savedDevice: ', savedDevice);
	// 	expect(savedDevice[0]).toMatchObject(mockDeviceRegistration);
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
			console.log('non existing nonce', err);
			expect(err.message).toBe('Document does not exist in the collection');
		}
	});

	// 	So for instance getRegisteredDevice  could have several tests:
	// Finds an item, deletes and returns it.
	// fit('getDeviceRegistration should find an item, delete and return it');
});
