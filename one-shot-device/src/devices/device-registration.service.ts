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

	async createChannelAndIdentity() {
		// create device identity
		const deviceIdentity = await this.identityClient.create('my-device' + Math.ceil(Math.random() * 1000));

		if (deviceIdentity === null) {
			this.logger.error('Failed to create identity for your device');
			throw new HttpException('Could not create the device identity.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		if (deviceIdentity == null) {
			this.logger.error('Failed to create identity for your device');
			throw new HttpException('Could not create the device identity.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

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
		console.log('document of identity (did): ', dto.identityKeys.id);
		console.log('channel address: ', dto.channelId);

		// 		Adjust the one-shot-device MS to the slu-status MS.
		// If a new device will be generated it shall call the POST endpoint of slu-status with the id.

		// return this.httpService
		// 	.post('https://api.example.com/authenticate_user', params, {
		// 		headers: {
		// 			'Content-Type': 'application/json'
		// 		}
		// 	})
		// 	.pipe(
		// 		map((res) => {
		// 			return res.data;
		// 		})
		// 	);
		const sluStatusEndpoint = this.configService.get('SLU_STATUS_URL');
		const id = dto.identityKeys.id;
		const channel = dto.channelId;
		const requestConfig: AxiosRequestConfig<any> = {
			headers: {
				'Content-Type': 'application/json'
			},
			data: {
				status: 'created'
			}
		};

		const sluStatus = await firstValueFrom(
			this.httpService.post(`${sluStatusEndpoint}/${id}/${channel}`, null, requestConfig).pipe(map((response) => res.data))
		);

		console.log('slu status', sluStatus);

		if (sluStatus === null) {
			this.logger.error('Failed connecting with SLU-Status Microservice');
			throw new HttpException('Could not connect with SLU-Status Microservice.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return { nonce: dto.nonce };
	}

	async getRegisteredDevice(nonce: string) {
		const response = await this.deviceRegistrationModel.findOne({ nonce });
		const deletedDocument = await this.deviceRegistrationModel.findOneAndDelete({ nonce }).exec();

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
