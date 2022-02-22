import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateDeviceRegistrationDto } from './dto/create-device-registration.dto';
import { DeviceRegistrationDocument, DeviceRegistration } from './schemas/device-registration.schema';
import { SaveChannelDto } from './dto/create-channel-info.dto';
import { ChannelInfoDocument, ChannelInfo } from './schemas/channel-info.schema';
import { HttpService } from '@nestjs/axios';
import { IdentityClient, ChannelClient } from 'iota-is-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DeviceRegistrationService {
	constructor(
		private readonly httpService: HttpService,

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
	async createChannelAndIdentity() {
		// create device identity
		const deviceIdentity = await this.identityClient.create('my-device' + Math.ceil(Math.random() * 1000));
		console.log('device identity: ', deviceIdentity);

		if (deviceIdentity === null) {
			this.logger.error('Failed to create identity for your device');
			throw new HttpException('Could not create the device identity.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		// It needs to receive a channelAddress in the payload where the device should subscribe to
		// remove channel creation and subscribe to the received channeladdress
		// Authenticate device identity
		await this.channelClient.authenticate(deviceIdentity.doc.id, deviceIdentity.key.secret);

		// create new channel
		const newChannel = await this.channelClient.create({
			topics: [{ type: 'example-data', source: 'data-creator' }]
		});
		console.log('new channel: ', newChannel);

		if (newChannel === null) {
			this.logger.error('Failed creating a new channel for your device');
			throw new HttpException('Could not create the channel.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		const saveChannelDto: SaveChannelDto = {
			channelId: newChannel.channelAddress,
			channelSeed: newChannel.seed
		};

		const channelInfoDoc = await this.channelInfoModel.create(saveChannelDto);
		await channelInfoDoc.save;
		console.log('channelDoc: ', channelInfoDoc);

		const createDeviceDto: CreateDeviceRegistrationDto = {
			nonce: uuidv4(),
			identityKeys: {
				id: deviceIdentity.doc.id,
				key: deviceIdentity.key
			}
		};
		const deviceDocument = await this.deviceRegistrationModel.create(createDeviceDto);
		await deviceDocument.save();

		// return {
		// const response = await (
		// 	this.httpService.post(/create, {
		// 		channelInfoDoc: channelInfoDoc
		// 	}),
		// { nonce: createDeviceDto.nonce }
		// }
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
