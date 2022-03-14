import { Controller, Get, Param, Post, Logger } from '@nestjs/common';
import { DeviceRegistrationService } from './device-registration.service';

@Controller()
export class DeviceRegistrationController {
	constructor(private readonly deviceRegistrationService: DeviceRegistrationService) {}
	private readonly logger: Logger = new Logger(DeviceRegistrationController.name);

	@Post('/create/:channelAddress')
	async createAndSubscribe(@Param('channelAddress') channelAddress: string) {
		try {
			const deviceIdentity = await this.deviceRegistrationService.createIdentityAndSubscribe(channelAddress);
			return {
				success: true,
				registerDevice: deviceIdentity
			};
		} catch (err) {
			this.logger.error('Failed to create user and identity', err.message);
			return {
				success: false
			};
		}
	}

	@Get('bootstrap/:nonce')
	async getRegisteredDevice(@Param('nonce') nonce: string) {
		try {
			const registeredDeviceInfo = await this.deviceRegistrationService.getRegisteredDevice(nonce);
			console.log('registeredDeviceInfo: ', registeredDeviceInfo);
			return {
				success: true,
				registeredDeviceInfo
			};
		} catch (err) {
			this.logger.error('Failed to get user and identity information', err.message);
			return {
				success: false
			};
		}
	}
}
