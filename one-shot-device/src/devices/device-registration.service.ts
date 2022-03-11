import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateDeviceRegistrationDto } from './dto/create-device-registration.dto';
import { DeviceRegistrationDocument, DeviceRegistration } from './schemas/device-registration.schema';
import { v4 as uuidv4 } from 'uuid';
import { IdentityClient, ChannelClient } from 'iota-is-sdk';
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
		@Inject('ChannelClient')
		private readonly channelClient: ChannelClient,
		@Inject('IdentityClient')
		private readonly identityClient: IdentityClient
	) {}
	private readonly logger: Logger = new Logger(DeviceRegistrationService.name);
	private readonly requestConfig: AxiosRequestConfig<any> = {
		headers: {
			'Content-Type': 'application/json',
			'X-API-KEY': process.env.IS_API_KEY
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

	private async createChannel(id: string, secret: string) {
		// Authenticate device identity
		await this.channelClient.authenticate(id, secret);

		// create new channel
		const newChannel = await this.channelClient.create({
			topics: [{ type: 'example-data', source: 'data-creator' }]
		});

		if (newChannel === null) {
			this.logger.error('Failed creating a new channel for your device');
			throw new HttpException('Could not create the channel.', HttpStatus.INTERNAL_SERVER_ERROR);
		}
		return newChannel;
	}

	private async createSluStatus(id: string, channelId: string) {
		const sluStatusEndpoint = this.configService.get('SLU_STATUS_URL');

		const sluStatus = await firstValueFrom(
			this.httpService.post(
				`${sluStatusEndpoint}/${id}/${channelId}`,
				{
					status: 'created'
				},
				this.requestConfig
			)
		);

		if (sluStatus === null) {
			this.logger.error('Failed connecting with SLU-Status Microservice');
			throw new HttpException('Could not connect with SLU-Status Microservice.', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
	private async updateSluStatus(id) {
		const sluStatusEndpoint = this.configService.get('SLU_STATUS_URL');
		const body = {
			status: 'installed'
		};

		const updateSluStatus = await firstValueFrom(
			this.httpService.put(`${sluStatusEndpoint}/${id}/${body.status}`, body, this.requestConfig)
		);

		if (updateSluStatus === null) {
			this.logger.error('Failed connecting with SLU-Status Microservice to update Slu status');
			throw new HttpException('Could not connect with SLU-Status Microservice to update Slu status.', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async createChannelAndIdentity() {
		const nonce = uuidv4();
		const deviceIdentity = await this.createIdentity();
		const {
			doc: { id },
			key
		} = deviceIdentity;
		const { secret } = key;

		const newChannel = await this.createChannel(id, secret);
		const { channelAddress: channelId, seed: channelSeed } = newChannel;

		const dto: CreateDeviceRegistrationDto = {
			nonce,
			channelId,
			channelSeed,
			identityKeys: {
				id,
				key
			}
		};

		const doc = await this.deviceRegistrationModel.create(dto);
		await doc.save();

		await this.createSluStatus(id, channelId);

		return { nonce };
	}

	async getRegisteredDevice(nonce: string) {
		const response = await this.deviceRegistrationModel.findOne({ nonce });
		const id = response.identityKeys.id;
		const deletedDocument = await this.deviceRegistrationModel.findOneAndDelete({ nonce }).exec();

		if (deletedDocument === null) {
			this.logger.error('Document does not exist in the collection');
			throw new HttpException('Could not find document in the collection.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		await this.updateSluStatus(id);

		return response;
	}
}
