import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateDeviceRegistrationDto } from './dto/create-device-registration.dto';
import { DeviceRegistrationDocument, DeviceRegistration } from './schemas/device-registration.schema';
import { SaveChannelDto } from './dto/create-channel-info.dto';
import { ChannelInfoDocument, ChannelInfo } from './schemas/channel-info.schema';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { defaultConfig } from './../configuration/configuration';
import { IdentityClient, ChannelClient, AccessRights } from 'iota-is-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DeviceRegistrationService {
	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,

		@InjectModel(DeviceRegistration.name)
		private readonly deviceRegistrationModel: Model<DeviceRegistrationDocument>,

		@InjectModel(ChannelInfo.name)
		private readonly channelInfoModel: Model<ChannelInfoDocument>,

		@Inject('OwnerClient')
		private readonly ownerClient: ChannelClient,

		@Inject('UserClient')
		private readonly userClient: ChannelClient,

		@Inject('IdentityClient')
		private readonly identityClient: IdentityClient
	) {}
	private readonly logger: Logger = new Logger(DeviceRegistrationService.name);

	async createIdentityAndSubscribe(channelAddress: string) {
		const deviceIdentity = await this.identityClient.create('my-device' + Math.ceil(Math.random() * 1000));

		if (deviceIdentity === null) {
			this.logger.error('Failed to create identity for your device');
			throw new HttpException('Could not create the device identity.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		const createDeviceDto: CreateDeviceRegistrationDto = {
			nonce: uuidv4(),
			identityKeys: {
				id: deviceIdentity.doc.id,
				key: deviceIdentity.key
			}
		};
		const deviceDocument = await this.deviceRegistrationModel.create(createDeviceDto);
		await deviceDocument.save();
		console.log('deviceDocument: ', deviceDocument);

		// // subscribe to the channel as user
		const { subscriptionLink } = await this.userClient.requestSubscription(channelAddress, {
			accessRights: AccessRights.ReadAndWrite
		});
		console.log('subscription Link: ', subscriptionLink);

		// const saveChannelDto: SaveChannelDto = {
		// 	channelId: newChannel.channelAddress,
		// 	channelSeed: newChannel.seed
		// };
		// if (newChannel === null) {
		// 	this.logger.error('Failed creating a new channel for your device');
		// 	throw new HttpException('Could not create the channel.', HttpStatus.INTERNAL_SERVER_ERROR);
		// }
		// const channelInfoDoc = await this.channelInfoModel.create(saveChannelDto);
		// await channelInfoDoc.save;
		// console.log('channelDoc: ', channelInfoDoc);

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
