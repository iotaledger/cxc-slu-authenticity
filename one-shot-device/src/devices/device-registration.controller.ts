import { Controller, Get, Param, Post, Logger } from '@nestjs/common';
import { DeviceRegistrationService } from './device-registration.service';

@Controller("/api/v1/one-shot-device")
export class DeviceRegistrationController {
	constructor(private readonly deviceRegistrationService: DeviceRegistrationService) { }
	private readonly logger: Logger = new Logger(DeviceRegistrationController.name);

	@Post('/create/:channelAddress/:creator/:deviceName')
	async createAndSubscribe(@Param('channelAddress') channelAddress: string, @Param('creator') creator: string, @Param('deviceName') deviceName: string) {
		try {
			const nonce = await this.deviceRegistrationService.createIdentityAndSubscribe(channelAddress, creator, deviceName);
			return {
				success: true,
				...nonce
			};
		} catch (err) {
			this.logger.error('Failed to create user and identity', { message: err.message });
			return {
				success: false,
				message: err.message
			};
		}
	}

	@Get('/bootstrap/:nonce')
	async getRegisteredDevice(@Param('nonce') nonce: string) {
		try {
			const registeredDeviceInfo = await this.deviceRegistrationService.getRegisteredDevice(nonce);
			return {
				success: true,
				...registeredDeviceInfo
			};
		} catch (err) {
			this.logger.error('Failed to get user and identity information', err.message);
			return {
				success: false
			};
		}
	}
}
