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

		private readonly requestConfig: AxiosRequestConfig<any> = {
			headers: {
				'Content-Type': 'application/json'
			}
		},

		@InjectModel(DeviceRegistration.name)
		private readonly deviceRegistrationModel: Model<DeviceRegistrationDocument>,
		@Inject('ChannelClient')
		private readonly channelClient: ChannelClient,
		@Inject('IdentityClient')
		private readonly identityClient: IdentityClient
	) {}
	private readonly logger: Logger = new Logger(DeviceRegistrationService.name);

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
		// If a new device will be generated it shall call the POST endpoint of slu-status with the id.
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

	async createChannelAndIdentity() {
		const deviceIdentity = await this.createIdentity();
		const {
			doc: { id },
			key
		} = deviceIdentity;
		const { secret } = key;
		const newChannel = await this.createChannel(id, secret);
		const { channelAddress: channelId, seed: channelSeed } = newChannel;
		const nonce = uuidv4();

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
		const deletedDocument = await this.deviceRegistrationModel.findOneAndDelete({ nonce }).exec();

		const sluStatusEndpoint = this.configService.get('SLU_STATUS_URL');
		const id = response.identityKeys.id;
		const body = {
			status: 'installed'
		};

		const updateSluStatus = await firstValueFrom(
			this.httpService.put(`${sluStatusEndpoint}/${id}/${body.status}`, body, this.requestConfig)
		);

		console.log('update Slu Status: ', updateSluStatus);

		if (deletedDocument === null) {
			this.logger.error('Document does not exist in the collection');
			throw new HttpException('Could not find document in the collection.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		// 		Adjust the one-shot-device MS to the slu-status MS.

		// If a new device will be generated it shall call the POST endpoint of slu-status with the id.
		// If the device will be downloaded by the device (calling GET /bootstrap/[NONCE]) it shall call the slu-status MS and update its status to installed
		return response;
	}
}
