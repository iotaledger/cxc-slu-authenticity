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
import { CreatorDevicesService } from 'src/creator-devices/creator-devices.service';

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
		private readonly identityClient: IdentityClient,

		private creatorDevicesService: CreatorDevicesService
	) { }
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

	private async subscribeToChannel(id: string, secret: string, channelAddress: string) {
		// Authenticate device identity
		await this.userClient.authenticate(id, secret);

		// // subscribe to the channel as user
		const requestSubscription = await this.userClient.requestSubscription(channelAddress, {
			accessRights: AccessRights.ReadAndWrite
		});

		if (requestSubscription === null) {
			this.logger.error('Failed to request subscriptionLink for your device.');
			throw new HttpException('Could not subscribe your device to the channel.', HttpStatus.INTERNAL_SERVER_ERROR);
		}
		return requestSubscription;
	}

	public async createSluStatus(id: string, channelAddress: string) {
		const sluStatusEndpoint = this.configService.get('SLU_STATUS_BASE_URL');

		const sluStatus = await firstValueFrom(
			this.httpService.post(
				`${sluStatusEndpoint}/status`,
				{
					id: id,
					status: 'created',
					channelAddress: channelAddress
				},
				this.requestConfig
			)
		);

		if (sluStatus === null) {
			this.logger.error('Failed connecting with SLU-Status Microservice');
			throw new HttpException('Could not connect with SLU-Status Microservice.', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	public async updateSluStatus(id: string) {
		const sluStatusEndpoint = this.configService.get('SLU_STATUS_BASE_URL');
		const body = {
			status: 'installed'
		};

		const updateSluStatus = await firstValueFrom(
			this.httpService.put(`${sluStatusEndpoint}/status/${id}/${body.status}`, body, this.requestConfig)
		);

		if (updateSluStatus === null) {
			this.logger.error('Failed connecting with SLU-Status Microservice to update Slu status');
			throw new HttpException('Could not connect with SLU-Status Microservice to update Slu status.', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async saveSluNonce(id: string, nonce: string, creator: string): Promise<void> {
		const sluStatusEndpoint = this.configService.get('SLU_STATUS_BASE_URL');
		const body = {
			sluId: id,
			nonce: nonce,
			creator: creator
		}
		await firstValueFrom(this.httpService.post(`${sluStatusEndpoint}/slu-nonce`, body, this.requestConfig));
	}

	async createIdentityAndSubscribe(channelAddress: string, creator: string) {
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
			nonce,
			subscriptionLink: subscriptionLink,
			channelSeed: seed,
			channelAddress,
			identityKey: {
				id,
				key
			}
		};

		const doc = await this.deviceRegistrationModel.create(deviceDocument);
		await doc.save();

		await this.createSluStatus(id, channelAddress);

		await this.saveSluNonce(id, nonce, creator);

		await this.creatorDevicesService.saveCreatorDevice({ id: id, channelAddress: channelAddress, creator: creator })

		return { nonce, channelAddress, id };
	}

	async getRegisteredDevice(nonce: string): Promise<DeviceRegistration> {
		const device = await this.deviceRegistrationModel.findOneAndDelete({ nonce }).exec();

		if (device == null) {
			this.logger.error('Document does not exist in the collection');
			throw new HttpException('Could not find document in the collection.', HttpStatus.INTERNAL_SERVER_ERROR);
		}
		const id = device.identityKey.id;

		await this.updateSluStatus(id);

		return {
			channelAddress: device.channelAddress,
			channelSeed: device.channelSeed,
			identityKey: device.identityKey,
			nonce: device.nonce,
			subscriptionLink: device.subscriptionLink
		};
	}
}
