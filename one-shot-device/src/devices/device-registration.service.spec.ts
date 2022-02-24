import { DeviceRegistrationController } from './device-registration.controller';
import { DeviceRegistrationService } from './device-registration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { DeviceRegistration, DeviceRegistrationDocument, DeviceRegistrationSchema } from './schemas/device-registration.schema';
import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { badNonceMock, identityMock, channelMock } from './mocks';
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

	it('deviceRegistrationService should be defined', async () => {
		await moduleCreator(identityMock, channelMock);
		expect(deviceRegistrationService).toBeDefined();
	});

	it('deviceRegistrationService should return nonce and created a device and a channel', async () => {
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

		expect(result.nonce).not.toBeNull();
		expect(result.nonce.length).toEqual(36);
	});

	it('deviceRegistrationService should return error for a null channel value', async () => {
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

	it('deviceRegistrationService should return error for a null identity value', async () => {
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

	it('should validate the DTO and save device identity to MongoDB', async () => {
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
		const createMongoDocument = await deviceRegistrationService.createChannelAndIdentity();
		const savedDevice = await deviceRegistrationModel.find({});
		expect(savedDevice[0].nonce).toStrictEqual(createMongoDocument.nonce);
	});

	it('should fail to remove device when provided with non existing nonce', async () => {
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
		try {
			await deviceRegistrationService.createChannelAndIdentity();
			await deviceRegistrationService.getRegisteredDevice(badNonceMock);
		} catch (err) {
			expect(err.message).toBe('Could not find document in the collection.');
		}
	});

	it('getDeviceRegistration should find an item, delete and return it', async () => {
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
		const registeredDevice = await deviceRegistrationService.createChannelAndIdentity();
		const deleteDeviceResult = await deviceRegistrationService.getRegisteredDevice(registeredDevice.nonce);
		expect(deleteDeviceResult).toMatchObject(registeredDevice);
		const checkForDeleteResult = await deviceRegistrationModel.find({ nonce: registeredDevice.nonce });
		expect(checkForDeleteResult).toStrictEqual([]);
	});
});
