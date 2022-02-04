import { Controller, Get, Param, Post } from '@nestjs/common';
import { DeviceRegistrationService } from './device-registration.service';

@Controller()
export class DeviceRegistrationController {
	constructor(private readonly deviceRegistrationService: DeviceRegistrationService) {}

	@Post('/create')
	async createChannelAndIdentity() {
		try {
			const registerDevice = await this.deviceRegistrationService.createChannelAndIdentity();
			return {
				success: true,
				registerDevice
			};
		} catch (err) {
			console.log(err);
			return {
				success: false,
				error: err?.response?.data?.error ? err.response.data.error : err.message
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
			console.log(err);
			return {
				success: false,
				error: err?.response?.data?.error ? err.response.data.error : err.message
			};
		}
	}
}
