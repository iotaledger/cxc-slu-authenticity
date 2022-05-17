import { Controller, Get, Param, Post, Logger, Body } from '@nestjs/common';
import { DeviceRegistrationService } from './device-registration.service';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('one-shot-device')
@Controller('/api/v1/one-shot-device')
export class DeviceRegistrationController {
	constructor(private readonly deviceRegistrationService: DeviceRegistrationService) { }
	private readonly logger: Logger = new Logger(DeviceRegistrationController.name);

	@Post('/create/:channelAddress/:creator')
	@ApiResponse({
		status: 201,
		description: 'The device registration was successful'
	})
	@ApiNotFoundResponse({ description: 'Failed to create user and identity' })
	@ApiInternalServerErrorResponse({
		description: 'Internal server error'
	})
	@ApiBody({
		type: String,
		examples: {
			devices: {
				description: 'For creating one device with a name.',
				value: {
					name: 'device-name'
				}
			}
		}
	})
	@ApiOperation({ summary: 'Create a channel as manager' })
	async createAndSubscribe(@Param('channelAddress') channelAddress: string, @Param('creator') creator: string, @Body() deviceName: { name: string }) {
		try {
			const nonce = await this.deviceRegistrationService.createIdentityAndSubscribe(channelAddress, creator, deviceName.name);
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
	@ApiOkResponse({
		description: 'Device was removed from the DB and its status changed to Installed'
	})
	@ApiNotFoundResponse({ description: 'Failed to get user and identity information' })
	@ApiInternalServerErrorResponse({
		description: 'Internal server error'
	})
	@ApiOperation({ summary: 'Delete device by nonce and change status to installed' })
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
