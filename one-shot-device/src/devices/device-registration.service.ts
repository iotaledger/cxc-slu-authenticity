import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceRegistrationDocument, DeviceRegistration } from './schemas/device-registration.schema';
import { IdentityClient, ChannelClient, AccessRights } from 'iota-is-sdk';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DeviceRegistrationService {
	constructor(
		private readonly httpService: HttpService,

		private readonly configService: ConfigService,

		@InjectModel(DeviceRegistration.name)
		private readonly deviceRegistrationModel: Model<DeviceRegistrationDocument>,

		@Inject('UserClient')
		private readonly userClient: ChannelClient,

		@Inject('IdentityClient')
		private readonly identityClient: IdentityClient
	) {}
	private readonly logger: Logger = new Logger(DeviceRegistrationService.name);
	private readonly requestConfig: AxiosRequestConfig<any> = {
		headers: {
			'Content-Type': 'application/json',
			'X-API-KEY': this.configService.get('SLU_STATUS_API_KEY')
		}
	};

	private async createIdentity() {
		const deviceIdentity = await this.identityClient.create('my-device' + Math.ceil(Math.random() * 1000));

		if (deviceIdentity === null) {
			this.logger.error('Failed to create identity for your device');
			throw new HttpException('Could not create the device identity.', HttpStatus.INTERNAL_SERVER_ERROR);
		}
		return deviceIdentity;
	}

	private async subscribeToChannel(id: string, secret: string, channelId: string) {
		// Authenticate device identity
		await this.userClient.authenticate(id, secret);

		// // subscribe to the channel as user
		const requestSubscription = await this.userClient.requestSubscription(channelId, {
			accessRights: AccessRights.ReadAndWrite
		});

		if (requestSubscription === null) {
			this.logger.error('Failed to request subscriptionLink for your device.');
			throw new HttpException('Could not subscribe your device to the channel.', HttpStatus.INTERNAL_SERVER_ERROR);
		}
		return requestSubscription;
	}

	public async createSluStatus(id: string, channelId: string) {
		const sluStatusEndpoint = this.configService.get('SLU_STATUS_URL');

		const sluStatus = await firstValueFrom(
			this.httpService.post(
				`${sluStatusEndpoint}/status/${id}/${channelId}`,
				{
					status: 'created'
				},
				this.requestConfig
			)
		);

		if (sluStatus === null) {
			this.logger.error('Failed connecting with SLU-Stat0us Microservice');
			throw new HttpException('Could not connect with SLU-Status Microservice.', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	public async updateSluStatus(id: string) {
		const sluStatusEndpoint = this.configService.get('SLU_STATUS_URL');
		const body = {
			status: 'installed'
		};

		const updateSluStatus = await firstValueFrom(
			this.httpService.put(`${sluStatusEndpoint}/status/${id}/${body.status}`, body, this.requestConfig)
		);
		console.log('udp: updateSluStatus:', updateSluStatus);

		if (updateSluStatus === null) {
			this.logger.error('Failed connecting with SLU-Status Microservice to update Slu status');
			throw new HttpException('Could not connect with SLU-Status Microservice to update Slu status.', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async createIdentityAndSubscribe(channelAddress: string) {
		const nonce = uuidv4();
		const deviceIdentity = await this.createIdentity();
		const {
			doc: { id },
			key
		} = deviceIdentity;
		const { secret } = key;

		const newChannel = await this.subscribeToChannel(id, secret, channelAddress);
		const { subscriptionLink, seed } = newChannel;

		const deviceDocument: DeviceRegistration = {
			nonce: uuidv4(),
			subscriptionLink: subscriptionLink,
			channelSeed: seed,
			channelId: channelAddress,
			identityKeys: {
				id,
				key
			}
		};

		const doc = await this.deviceRegistrationModel.create(deviceDocument);
		await doc.save();

		await this.createSluStatus(id, channelAddress);

		return { nonce };
	}

	async getRegisteredDevice(nonce: string): Promise<DeviceRegistration> {
		const device = await this.deviceRegistrationModel.findOneAndDelete({ nonce }).exec();
		const id = device.identityKeys.id;

		if (device == null) {
			this.logger.error('Document does not exist in the collection');
			throw new HttpException('Could not find document in the collection.', HttpStatus.INTERNAL_SERVER_ERROR);
		}
		await this.updateSluStatus(id);

		return {
			channelId: device.channelId,
			channelSeed: device.channelSeed,
			identityKeys: device.identityKeys,
			nonce: device.nonce,
			subscriptionLink: device.subscriptionLink
		};
	}
}
