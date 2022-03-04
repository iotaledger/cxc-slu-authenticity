import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateDeviceRegistrationDto } from './dto/create-device-registration.dto';
import { DeviceRegistrationDocument, DeviceRegistration } from './schemas/device-registration.schema';
import { IdentityClient, ChannelClient, AccessRights } from 'iota-is-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DeviceRegistrationService {
	constructor(
		@InjectModel(DeviceRegistration.name)
		private readonly deviceRegistrationModel: Model<DeviceRegistrationDocument>,

		@Inject('UserClient')
		private readonly userClient: ChannelClient,

		@Inject('IdentityClient')
		private readonly identityClient: IdentityClient
	) {}
	private readonly logger: Logger = new Logger(DeviceRegistrationService.name);

	async createIdentityAndSubscribe(channelAddress: string) {
		const deviceIdentity = await this.identityClient.create('my-device' + Math.ceil(Math.random() * 1000));

		if (deviceIdentity === null) {
			this.logger.error('Failed to create identity for your device.');
			throw new HttpException('Could not create the device identity.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		await this.userClient.authenticate(deviceIdentity.doc.id, deviceIdentity.key.secret);

		// // subscribe to the channel as user
		const requestSubscription = await this.userClient.requestSubscription(channelAddress, {
			accessRights: AccessRights.ReadAndWrite
		});

		if (requestSubscription === null) {
			this.logger.error('Failed to request subscriptionLink for your device.');
			throw new HttpException('Could not subscribe your device to the channel.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		console.log('subscriptionLink and seed :', { requestSubscription });
		const deviceDocument: CreateDeviceRegistrationDto = {
			nonce: uuidv4(),
			channelId: requestSubscription.subscriptionLink,
			channelSeed: requestSubscription.seed,
			identityKeys: {
				id: deviceIdentity.doc.id,
				key: deviceIdentity.key
			}
		};
		const doc = await this.deviceRegistrationModel.create(deviceDocument);
		await doc.save();

		console.log('deviceDocument: ', deviceDocument);

		return { nonce: deviceDocument.nonce };
	}

	async getRegisteredDevice(nonce: string) {
		const deletedDocument = await this.deviceRegistrationModel.findOneAndDelete({ nonce }).exec();
		if (deletedDocument === null) {
			this.logger.error('Document does not exist in the collection');
			throw new HttpException('Could not find document in the collection.', HttpStatus.INTERNAL_SERVER_ERROR);
		}
		return deletedDocument;
	}
}
