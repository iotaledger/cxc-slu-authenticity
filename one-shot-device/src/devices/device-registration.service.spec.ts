import { DeviceRegistrationController } from './device-registration.controller';
import { DeviceRegistrationService } from './device-registration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule, getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { DeviceRegistration, DeviceRegistrationDocument, DeviceRegistrationSchema } from './schemas/device-registration.schema';
import { Model, Connection } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { badNonceMock, identityMock, channelMock, authorizedChannelMock, requestSubscription } from './mocks';
import { RequestSubscriptionResponse } from '@iota/is-client';
import { IdentityJson } from '@iota/is-client';
import { CreatorDevicesModule } from '../creator-devices/creator-devices.module';

describe('DeviceRegistrationController', () => {
	let deviceRegistrationService: DeviceRegistrationService;
	let deviceRegistrationModel: Model<DeviceRegistrationDocument>;
	let module: TestingModule;
	let mongod: MongoMemoryServer;
	let connection: Connection;
	const creator = 'did:iota:12345';
	const deviceName = 'test-name';

	const moduleCreator = async (identityClientMock: IdentityJson | any, subscriptionResponseMock: RequestSubscriptionResponse | any) => {
		module = await Test.createTestingModule({
			imports: [
				CreatorDevicesModule,
				HttpModule,
				ConfigModule,
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
					provide: 'IdentityClient',
					useValue: identityClientMock
				},
				{
					provide: 'UserClient',
					useValue: subscriptionResponseMock
				}
			]
		}).compile();

		deviceRegistrationService = module.get<DeviceRegistrationService>(DeviceRegistrationService);
		deviceRegistrationModel = module.get<Model<DeviceRegistrationDocument>>(getModelToken(DeviceRegistration.name));
		connection = module.get<Connection>(getConnectionToken());
	};

	it('deviceRegistrationService should be defined', async () => {
		await moduleCreator(identityMock, channelMock);
		expect(deviceRegistrationService).toBeDefined();
	});

	it('deviceRegistrationService should call createSluStatus and saveSluNonce', async () => {
		await moduleCreator(
			{
				create: () => identityMock
			},
			{
				authenticate: () => {
					identityMock.doc.id, identityMock.key.secret;
				},
				requestSubscription: () => {
					return {
						subscriptionLink: requestSubscription.subscriptionLink,
						seed: requestSubscription.seed
					};
				},
				info: () => {return {name: 'channelName'}}
			}
		);

		const createSluStatusSpy = jest.spyOn(deviceRegistrationService, 'createSluStatus').mockResolvedValue(Promise.resolve());
		const saveSluNonceSpy = jest.spyOn(deviceRegistrationService, 'saveSluNonce').mockResolvedValue(Promise.resolve());
		await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock, creator, deviceName);
		expect(createSluStatusSpy).toHaveBeenCalled();
		expect(saveSluNonceSpy).toHaveBeenCalled();
	});

	it('deviceRegistrationService should validate the DTO and save device identity to MongoDB then return nonce and subscribe link to a channel', async () => {
		await moduleCreator(
			{
				create: () => identityMock
			},
			{
				authenticate: () => {
					identityMock.doc.id, identityMock.key.secret;
				},
				requestSubscription: () => {
					return {
						subscriptionLink: requestSubscription.subscriptionLink,
						seed: requestSubscription.seed
					};
				},
				info: () => {return {name: 'channelName'}}
			}
		);

		jest.spyOn(deviceRegistrationService, 'createSluStatus').mockResolvedValue(Promise.resolve());
		jest.spyOn(deviceRegistrationService, 'saveSluNonce').mockResolvedValue(Promise.resolve());
		await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock, creator, deviceName);
		const createMongoDocument = await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock, creator, deviceName);

		expect(createMongoDocument.nonce).not.toBeNull();
		expect(createMongoDocument.nonce.length).toEqual(36);
	});

	it('deviceRegistrationService should return error for a null request subscriptionLink', async () => {
		await moduleCreator(
			{
				create: () => identityMock
			},
			{
				authenticate: () => {
					identityMock.doc.id, identityMock.key.secret;
				},
				requestSubscription: () => null,
				info: () => {return {name: 'channelName'}}
			}
		);

		try {
			await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock, creator, deviceName);
		} catch (err) {
			expect(err.message).toBe('Could not subscribe your device to the channel.');
		}
	});

	it('deviceRegistrationService should return error for a null identity value', async () => {
		await moduleCreator(
			{
				create: () => null
			},
			{
				authenticate: () => {
					identityMock.doc.id, identityMock.key.secret;
				},
				requestSubscription: () => {
					return {
						subscriptionLink: requestSubscription.subscriptionLink,
						seed: requestSubscription.seed
					};
				},
				info: () => {return {name: 'channelName'}}
			}
		);

		let error: Error;

		try {
			await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock, creator, deviceName);
		} catch (err) {
			error = err;
		}

		expect(error?.message).toBe('Could not create the device identity.');
	});

	it('should validate the DTO and save device identity to MongoDB', async () => {
		await moduleCreator(
			{
				create: () => identityMock
			},
			{
				authenticate: () => {
					identityMock.doc.id, identityMock.key.secret;
				},
				requestSubscription: () => {
					return {
						subscriptionLink: requestSubscription.subscriptionLink,
						seed: requestSubscription.seed
					};
				},
				info: () => {return {name: 'channelName'}}
			}
		);

		jest.spyOn(deviceRegistrationService, 'createSluStatus').mockResolvedValue(Promise.resolve());
		jest.spyOn(deviceRegistrationService, 'saveSluNonce').mockResolvedValue(Promise.resolve());
		await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock, creator, deviceName);
		const savedDevice = await deviceRegistrationModel.find({});
		expect(savedDevice[0].channelAddress).toStrictEqual(authorizedChannelMock);
	});

	it('should fail to remove device when provided with non existing nonce', async () => {
		await moduleCreator(
			{
				create: () => identityMock
			},
			{
				authenticate: () => {
					identityMock.doc.id, identityMock.key.secret;
				},
				requestSubscription: () => {
					return {
						subscriptionLink: requestSubscription.subscriptionLink,
						seed: requestSubscription.seed
					};
				},
				info: () => {return {name: 'channelName'}}
			}
		);

		jest.spyOn(deviceRegistrationService, 'createSluStatus').mockResolvedValue(Promise.resolve());
		jest.spyOn(deviceRegistrationService, 'saveSluNonce').mockResolvedValue(Promise.resolve());
		await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock, creator, deviceName);
		await deviceRegistrationModel.find({});
		jest.spyOn(deviceRegistrationService, 'updateSluStatus').mockResolvedValue(Promise.resolve());

		try {
			const tryWithBadNonce = await deviceRegistrationService.getRegisteredDevice(badNonceMock);
		} catch (err) {
			expect(err.message).toBe('Could not find document in the collection.');
		}
	});

	it('getDeviceRegistration should call updateSluStatus', async () => {
		await moduleCreator(
			{
				create: () => identityMock
			},
			{
				authenticate: () => {
					identityMock.doc.id, identityMock.key.secret;
				},
				requestSubscription: () => {
					return {
						subscriptionLink: requestSubscription.subscriptionLink,
						seed: requestSubscription.seed
					};
				},
				info: () => {return {name: 'channelName'}}
			}
		);

		const updateSluStatusSpy = jest.spyOn(deviceRegistrationService, 'createSluStatus').mockResolvedValue(Promise.resolve());
		jest.spyOn(deviceRegistrationService, 'saveSluNonce').mockResolvedValue(Promise.resolve());
		await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock, creator, deviceName);
		jest.spyOn(deviceRegistrationService, 'updateSluStatus').mockResolvedValue(Promise.resolve());
		const registeredDevice = await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock, creator, deviceName);
		await deviceRegistrationService.getRegisteredDevice(registeredDevice.nonce);

		expect(updateSluStatusSpy).toHaveBeenCalled();
	});

	it('getDeviceRegistration should find an item, delete and return it', async () => {
		await moduleCreator(
			{
				create: () => identityMock
			},
			{
				authenticate: () => {
					identityMock.doc.id, identityMock.key.secret;
				},
				requestSubscription: () => {
					return {
						subscriptionLink: requestSubscription.subscriptionLink,
						seed: requestSubscription.seed
					};
				},
				info: () => {return {name: 'channelName'}}
			}
		);

		jest.spyOn(deviceRegistrationService, 'createSluStatus').mockResolvedValue(Promise.resolve());
		jest.spyOn(deviceRegistrationService, 'saveSluNonce').mockResolvedValue(Promise.resolve());
		await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock, creator, deviceName);
		jest.spyOn(deviceRegistrationService, 'updateSluStatus').mockResolvedValue(Promise.resolve());
		const registeredDevice = await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock, creator, deviceName);
		const deleteDeviceResult = await deviceRegistrationService.getRegisteredDevice(registeredDevice.nonce);

		expect(deleteDeviceResult.channelAddress).toEqual(registeredDevice.channelAddress);
		expect(deleteDeviceResult.identityKey.id).toEqual(registeredDevice.id);
		expect(deleteDeviceResult.nonce).toEqual(registeredDevice.nonce);
		const checkForDeleteResult = await deviceRegistrationModel.find({ nonce: registeredDevice.nonce });
		expect(checkForDeleteResult).toStrictEqual([]);
	});

	afterEach(async () => {
		module.close();
		await connection.close();
		if (mongod) mongod.stop();
	});
});
