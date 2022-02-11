import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { defaultConfig } from '../configuration/configuration';
import { InjectModel } from '@nestjs/mongoose';
import { CreateDeviceRegistrationDto } from './dto/create-device-registration.dto';
import { DeviceRegistrationDocument, DeviceRegistration } from './schemas/device-registration.schema';
import { v4 as uuidv4 } from 'uuid';
import { IdentityClient, ChannelClient } from 'iota-is-sdk';

@Injectable()
export class DeviceRegistrationService {
	constructor(
		@InjectModel(DeviceRegistration.name)
		private deviceRegistrationModel: Model<DeviceRegistrationDocument>
	) {}
	private readonly logger: Logger = new Logger(DeviceRegistrationService.name);

	async createChannelAndIdentity() {
		const channelClient = new ChannelClient(defaultConfig);
		const identityClient = new IdentityClient(defaultConfig);

		// create device identity
		const deviceIdentity = await identityClient.create('my-device' + Math.ceil(Math.random() * 1000));

		// Authenticate device identity
		await channelClient.authenticate(deviceIdentity.doc.id, deviceIdentity.key.secret);

		// create new channel
		const newChannel = await channelClient.create({
			topics: [{ type: 'example-data', source: 'data-creator' }]
		});

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
	}

	async getRegisteredDevice(nonce) {
		const response = await this.deviceRegistrationModel.findOne({ nonce });
		const deletedDocument = await this.deviceRegistrationModel.findOneAndDelete({ nonce }).exec();
		if (deletedDocument === null) {
			this.logger.error('Document does not exist in the collection');
		}
		return response;
	}
}
