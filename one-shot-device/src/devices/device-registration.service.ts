import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateDeviceRegistrationDto } from './dto/create-device-registration.dto';
import { DeviceRegistrationDocument, DeviceRegistration } from './schemas/device-registration.schema';
import { SaveChannelDto } from './dto/create-channel-info.dto';
import { ChannelInfoDocument, ChannelInfo } from './schemas/channel-info.schema';
import { IdentityClient, ChannelClient } from 'iota-is-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DeviceRegistrationService {
	constructor(
		@InjectModel(DeviceRegistration.name)
		private readonly deviceRegistrationModel: Model<DeviceRegistrationDocument>,

		@InjectModel(ChannelInfo.name)
		private readonly channelInfoModel: Model<ChannelInfoDocument>,

		@Inject('ChannelClient')
		private readonly channelClient: ChannelClient,
		@Inject('IdentityClient')
		private readonly identityClient: IdentityClient
	) {}
	private readonly logger: Logger = new Logger(DeviceRegistrationService.name);

	// adjust POST /create
	// It needs to receive a channelAddress in the payload where the device should subscribe to
	// 	device is currently created and creates a channel

	async createChannelAndIdentity() {
		// create device identity
		const deviceIdentity = await this.identityClient.create('my-device' + Math.ceil(Math.random() * 1000));
		console.log('device identity: ', deviceIdentity);

		if (deviceIdentity === null) {
			this.logger.error('Failed to create identity for your device');
			throw new HttpException('Could not create the device identity.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		// remove channel creation and subscribe to the received channeladdress
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

		// rework the dto - channel needs to be deleted and new Model created to save // store the channel information like seed and subscriptionlink in the database

		const saveChannelDto: SaveChannelDto = {
			channelId: newChannel.channelAddress,
			channelSeed: newChannel.seed
		};

		const channelInfoDoc = await this.channelInfoModel.create(saveChannelDto);
		await channelInfoDoc.save;

		const dto: CreateDeviceRegistrationDto = {
			nonce: uuidv4(),
			identityKeys: {
				id: deviceIdentity.doc.id,
				key: deviceIdentity.key
			}
		};
		const deviceDocument = await this.deviceRegistrationModel.create(dto);
		await deviceDocument.save();
		return { nonce: dto.nonce };
	}

	async getRegisteredDevice(nonce: string) {
		const response = await this.deviceRegistrationModel.findOne({ nonce });
		const deletedDocument = await this.deviceRegistrationModel.findOneAndDelete({ nonce }).exec();
		if (deletedDocument === null) {
			this.logger.error('Document does not exist in the collection');
			throw new HttpException('Could not find document in the collection.', HttpStatus.INTERNAL_SERVER_ERROR);
		}
		return response;
	}
}
