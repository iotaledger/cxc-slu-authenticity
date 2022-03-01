import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateDeviceRegistrationDto } from './dto/create-device-registration.dto';
import { DeviceRegistrationDocument, DeviceRegistration } from './schemas/device-registration.schema';
import { v4 as uuidv4 } from 'uuid';
import { IdentityClient, ChannelClient } from 'iota-is-sdk';

@Injectable()
export class DeviceRegistrationService {
	constructor(
		@InjectModel(DeviceRegistration.name)
		private readonly deviceRegistrationModel: Model<DeviceRegistrationDocument>,
		@Inject('ChannelClient')
		private readonly channelClient: ChannelClient,
		@Inject('IdentityClient')
		private readonly identityClient: IdentityClient
	) {}
	private readonly logger: Logger = new Logger(DeviceRegistrationService.name);

	async createChannelAndIdentity() {
		// create device identity
		const deviceIdentity = await this.identityClient.create('my-device' + Math.ceil(Math.random() * 1000));

		if (deviceIdentity === null) {
			this.logger.error('Failed to create identity for your device');
			throw new HttpException('Could not create the device identity.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		// Authenticate device identity
		await this.channelClient.authenticate(deviceIdentity.doc.id, deviceIdentity.key.secret);

		// create new channel
		const newChannel = await this.channelClient.create({
			topics: [{ type: 'example-data', source: 'data-creator' }]
		});

		if (newChannel === null) {
			this.logger.error('Failed creating a new channel for your device');
			throw new HttpException('Could not create the channel.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		const dto: CreateDeviceRegistrationDto = {
			nonce: uuidv4(),
			channelId: newChannel.channelAddress,
			channelSeed: newChannel.seed,
			identityKeys: {
				id: deviceIdentity.doc.id,
				key: deviceIdentity.key
			}
		};
		const doc = await this.deviceRegistrationModel.create(dto);
		await doc.save();
		return { nonce: dto.nonce };
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
