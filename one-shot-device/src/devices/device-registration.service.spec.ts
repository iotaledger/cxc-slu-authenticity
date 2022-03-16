import { DeviceRegistrationController } from './device-registration.controller';
import { DeviceRegistrationService } from './device-registration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule, getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { DeviceRegistration, DeviceRegistrationDocument, DeviceRegistrationSchema } from './schemas/device-registration.schema';
import { Model, Connection } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { badNonceMock, identityMock, channelMock, authorizedChannelMock, authorizedChannelMock1, requestSubscription } from './mocks';
import { RequestSubscriptionResponse } from 'iota-is-sdk/lib/models/types/request-response-bodies';
import { IdentityJson } from 'iota-is-sdk/lib/models/types/identity';

describe('DeviceRegistrationController', () => {
	let deviceRegistrationService: DeviceRegistrationService;
	let deviceRegistrationModel: Model<DeviceRegistrationDocument>;
	let module: TestingModule;
	let mongod: MongoMemoryServer;
	let connection: Connection;

	const moduleCreator = async (identityClientMock: IdentityJson | any, subscriptionResponseMock: RequestSubscriptionResponse | any) => {
		module = await Test.createTestingModule({
			imports: [
				HttpModule,
				ConfigModule,
				MongooseModule.forRootAsync({
					useFactory: async () => {
						mongod = await MongoMemoryServer.create();
						const uri = mongod.getUri();
						console.log(uri);
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

	fit('deviceRegistrationService should be defined', async () => {
		await moduleCreator(identityMock, channelMock);
		expect(deviceRegistrationService).toBeDefined();
	});

	fit('deviceRegistrationService should validate the DTO and save device identity to MongoDB then return nonce and subscribe link to a channel', async () => {
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
				}
			}
		);
		const createMongoDocument = await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock);

		expect(createMongoDocument.nonce).not.toBeNull();
		expect(createMongoDocument.nonce.length).toEqual(36);
		const savedDevice = await deviceRegistrationModel.find({});
		expect(savedDevice[0].nonce).toStrictEqual(createMongoDocument.nonce);
	});

	fit('deviceRegistrationService should return error for a null request subscriptionLink', async () => {
		await moduleCreator(
			{
				create: () => identityMock
			},
			{
				authenticate: () => {
					identityMock.doc.id, identityMock.key.secret;
				},
				requestSubscription: () => null
			}
		);
		try {
			await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock);
		} catch (err) {
			expect(err.message).toBe('Could not subscribe your device to the channel.');
		}
	});

	fit('deviceRegistrationService should return error for a null identity value', async () => {
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
				}
			}
		);
		try {
			await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock);
		} catch (err) {
			expect(err.message).toBe('Could not create the device identity.');
		}
	});

	// fit('should validate the DTO and save device identity to MongoDB', async () => {
	// 	await moduleCreator(
	// 		{
	// 			create: () => identityMock
	// 		},
	// 		{
	// 			authenticate: () => {
	// 				generateDid(), identityMock.key.secret;
	// 			},
	// 			requestSubscription: () => {
	// 				return {
	// 					subscriptionLink: requestSubscription.subscriptionLink,
	// 					seed: requestSubscription.seed
	// 				};
	// 			}
	// 		}
	// 	);
	// 	const createMongoDocument = await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock);
	// 	const savedDevice = await deviceRegistrationModel.find({});
	// 	expect(savedDevice[0].nonce).toStrictEqual(createMongoDocument.nonce);
	// });

	fit('should fail to remove device when provided with non existing nonce', async () => {
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
				}
			}
		);
		try {
			await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock1);
			await deviceRegistrationService.getRegisteredDevice(badNonceMock);
		} catch (err) {
			expect(err.message).toBe('Could not find document in the collection.');
		}
	});

	fit('getDeviceRegistration should find an item, delete and return it', async () => {
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
				}
			}
		);
		const registeredDevice = await deviceRegistrationService.createIdentityAndSubscribe(authorizedChannelMock1);
		const deleteDeviceResult = await deviceRegistrationService.getRegisteredDevice(registeredDevice.nonce);
		expect(deleteDeviceResult).toMatchObject(registeredDevice);
		const checkForDeleteResult = await deviceRegistrationModel.find({ nonce: registeredDevice.nonce });
		expect(checkForDeleteResult).toStrictEqual([]);
	});

	afterEach(async () => {
		module.close();
		await connection.close();
		if (mongod) mongod.stop();
	});
});
