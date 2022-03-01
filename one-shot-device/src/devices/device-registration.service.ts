import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateDeviceRegistrationDto } from './dto/create-device-registration.dto';
import { DeviceRegistrationDocument, DeviceRegistration } from './schemas/device-registration.schema';
import { SaveChannelDto } from './dto/create-channel-info.dto';
import { ChannelInfoDocument, ChannelInfo } from './schemas/channel-info.schema';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { IdentityClient, ChannelClient } from 'iota-is-sdk';
import { firstValueFrom } from 'rxjs';
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
		private readonly channelClient: ChannelClient,

		@Inject('UserClient')
		private readonly userClient: ChannelClient,

		@Inject('IdentityClient')
		private readonly identityClient: IdentityClient
	) {}
	private readonly logger: Logger = new Logger(DeviceRegistrationService.name);

	// adjust POST /create
	async createIdentity() {
		const deviceIdentity = await this.identityClient.create('my-device' + Math.ceil(Math.random() * 1000));

		if (deviceIdentity === null) {
			this.logger.error('Failed to create identity for your device');
			throw new HttpException('Could not create the device identity.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		// saving identity to mongo is probably not necessary anymore
		const createDeviceDto: CreateDeviceRegistrationDto = {
			nonce: uuidv4(),
			identityKeys: {
				id: deviceIdentity.doc.id,
				key: deviceIdentity.key
			}
		};
		const deviceDocument = await this.deviceRegistrationModel.create(createDeviceDto);
		await deviceDocument.save();

		// nonce is now being returned by the prove-ownership endpoint (40 chars!), what is needed to authenticate is the secret and did
		// nonce needs to be signed in the CLI via nonce-signer, secret is also needed in this step
		// then the returned signed in nonce is is used to authenticate
		return { seed: deviceIdentity.key.secret, did: deviceIdentity.doc.id };
	}

	async authenticateAndSubscribe(jwt: string) {
		// It needs to receive a channelAddress in the payload where the device should subscribe to
		// remove channel creation and subscribe to the received channeladdress
		// make http / post to create channel and get it in the payload

		const integrationServicesUrl = this.configService.get<string>('IS_API_URL');
		const apiKey = this.configService.get<string>('IS_API_KEY');
		const newChannel = await firstValueFrom(
			this.httpService.post(
				`${integrationServicesUrl}/channels/create?api-key=${apiKey}`,
				{
					channelAddress: '2cda038ca18d91e3fcdaac39eecb1ae530043037cfc39afae89742f23ec7fb960000000000000000:16f9131bd437682ad825525e',
					presharedKey: '8439683d3aa1915575d95297f8205e50',
					seed: 'ezcavmjkogwkrlbautfnhjlvmoalpdfqzngrlwddspfjplmaqbemxdnriqtqfppvxifjllww'
				},
				{
					headers: { 'Authorization ': `${jwt}` }
				}
			)
		);
		const channelAddress = newChannel.channelAddress;
		// subscribe to the channel as user
		const { subscriptionLink } = await this.userClient.requestSubscription(channelAddress, {
			accessRights: AccessRights.ReadAndWrite
		});

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
