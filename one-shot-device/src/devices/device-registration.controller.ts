import { Controller, Get, Param, Post, Body, Logger } from '@nestjs/common';
import { DeviceRegistrationService } from './device-registration.service';
import { SaveChannelDto } from './dto/create-channel-info.dto';

@Controller()
export class DeviceRegistrationController {
	constructor(private readonly deviceRegistrationService: DeviceRegistrationService) {}
	private readonly logger: Logger = new Logger(DeviceRegistrationController.name);

	// @Post()
	// createMessage(@Body() message: MessageDto) {
	// 	console.log(message);
	// 	return message;
	// }

	@Post('/create')
	async createChannelAndIdentity(@Body() body: SaveChannelDto) {
		try {
			const registerDevice = await this.deviceRegistrationService.createChannelAndIdentity();
			console.log('Register device: ', registerDevice);
			console.log('body: ', body);
			return {
				success: true,
				registerDevice,
				body
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
