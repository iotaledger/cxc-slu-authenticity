import { Controller, Get, Param, Post, Body, Logger, Header } from '@nestjs/common';
import { DeviceRegistrationService } from './device-registration.service';
import { SaveChannelDto } from './dto/create-channel-info.dto';

@Controller()
export class DeviceRegistrationController {
	constructor(private readonly deviceRegistrationService: DeviceRegistrationService) {}
	private readonly logger: Logger = new Logger(DeviceRegistrationController.name);

	const jwt = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiZGlkOmlvdGE6OU1hOEhmWmVZYlFodEVLWlV0cHhNMTNQZWs2YnZabkoxNkZyeWVOMXVEVDciLCJwdWJsaWNLZXkiOiJEQnhZb2VuU1VTeHlhWVRMaU5wbnNWSDFSSDlrRm5wcHVOdFI3eVhlSEFDNyIsInVzZXJuYW1lIjoibXktZGV2aWNlODk2IiwicmVnaXN0cmF0aW9uRGF0ZSI6IjIwMjItMDMtMDFUMjM6MDQ6NDIrMDE6MDAiLCJjbGFpbSI6eyJ0eXBlIjoiUGVyc29uIn0sInJvbGUiOiJVc2VyIn0sImlhdCI6MTY0NjE3MjM4NCwiZXhwIjoxNjQ2MjU4Nzg0fQ.WefGMZFoZaIlDpj1ETi2HhVYFFg1j9ib-bFIjKEqjBA`;

	@Post('/create')
	async createChannelAndIdentity() {
		try {
			const deviceIdentity = await this.deviceRegistrationService.createIdentity();
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


	@Post('/subscribe')

	async authenticateAndSubscribe(@Body() body: SaveChannelDto, @Header("Authorization", `Bearer ${jwt}`)) {
		console.log('body: ', body.channelId, body.channelSeed);
		try {
			const authenticateDevice = await this.deviceRegistrationService.authenticateAndSubscribe();
			console.log('authenticate and subscribe: ', authenticateDevice);
			return body;
		} catch (err) {
			this.logger.error('Failed to subscribe your device', err.message);
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
