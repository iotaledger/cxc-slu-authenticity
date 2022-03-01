import { Controller, Get, Param, Post, Body, Logger } from '@nestjs/common';
import { DeviceRegistrationService } from './device-registration.service';
import { SaveChannelDto } from './dto/create-channel-info.dto';

@Controller()
export class DeviceRegistrationController {
	constructor(private readonly deviceRegistrationService: DeviceRegistrationService) {}
	private readonly logger: Logger = new Logger(DeviceRegistrationController.name);

	@Post('/create')
	async createChannelAndIdentity(@Body() body: SaveChannelDto) {
		try {
			const deviceIdentity = await this.deviceRegistrationService.createIdentity();
			console.log('Register device: ', deviceIdentity);
			console.log('body: ', body.channelId, body.channelSeed);
			return {
				success: true,
				registerDevice: deviceIdentity,
				body
			};
		} catch (err) {
			this.logger.error('Failed to create user and identity', err.message);
			return {
				success: false
			};
		}
	}

	// @Post('/subscribe')
	// async authenticateAndSubscribe() {
	// 	try {
	// 		const authenticateDevice = await this.deviceRegistrationService.authenticateAndSubscribe(nonce, channelAddress);
	// 		console.log('authenticate and subscribe: ', authenticateDevice);
	// 	} catch (err) {
	// 		this.logger.error('Failed to subscribe your device', err.message);
	// 		return {
	// 			success: false
	// 		};
	// 	}
	// }

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
