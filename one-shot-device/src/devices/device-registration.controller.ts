import { Logger } from '@nestjs/common';
import { Controller, Get, Param, Post } from '@nestjs/common';
import { DeviceRegistrationService } from './device-registration.service';

@Controller()
export class DeviceRegistrationController {
	constructor(private readonly deviceRegistrationService: DeviceRegistrationService) {}
	private readonly logger: Logger = new Logger(DeviceRegistrationController.name);

	@Post('/create')
	async createChannelAndIdentity() {
		try {
			const registerDevice = await this.deviceRegistrationService.createChannelAndIdentity();
			console.log('Register device: ', registerDevice);
			return {
				success: true,
				registerDevice
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
