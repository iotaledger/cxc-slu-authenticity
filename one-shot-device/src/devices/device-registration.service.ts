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

	async authenticateAndSubscribe() {
		// It needs to receive a channelAddress in the payload where the device should subscribe to
		// remove channel creation and subscribe to the received channeladdress
		// make http / post to create channel and get it in the payload

		const integrationServicesUrl = this.configService.get<string>('IS_API_URL');
		const apiKey = this.configService.get<string>('IS_API_KEY');
		const jwt = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZGlkOmlvdGE6OU1hOEhmWmVZYlFodEVLWlV0cHhNMTNQZWs2YnZabkoxNkZyeWVOMXVEVDciLCJwdWJsaWNLZXkiOiJEQnhZb2VuU1VTeHlhWVRMaU5wbnNWSDFSSDlrRm5wcHVOdFI3eVhlSEFDNyIsInVzZXJuYW1lIjoibXktZGV2aWNlODk2IiwicmVnaXN0cmF0aW9uRGF0ZSI6IjIwMjItMDMtMDFUMjM6MDQ6NDIrMDE6MDAiLCJjbGFpbSI6eyJ0eXBlIjoiUGVyc29uIn0sInJvbGUiOiJVc2VyIn0sImlhdCI6MTY0NjE3MjM4NCwiZXhwIjoxNjQ2MjU4Nzg0fQ.WefGMZFoZaIlDpj1ETi2HhVYFFg1j9ib-bFIjKEqjBA`;

		const newChannel = await firstValueFrom(
			this.httpService.post(`${integrationServicesUrl}/channels/create?api-key=${apiKey}`, {
				// body.channelId,
				// body.channelSeed
			})
		);
		// const channelAddress = newChannel.channelAddress;
		console.log('newChannel: ', newChannel);
		// // subscribe to the channel as user
		// const { subscriptionLink } = await this.userClient.requestSubscription(channelAddress, {
		// 	accessRights: AccessRights.ReadAndWrite
		// });

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
