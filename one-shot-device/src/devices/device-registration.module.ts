import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { DeviceRegistrationController } from './device-registration.controller';
import { DeviceRegistrationService } from './device-registration.service';
import { DeviceRegistrationSchema, DeviceRegistration } from './schemas/device-registration.schema';
import { ChannelInfoSchema, ChannelInfo } from './schemas/channel-info.schema';
import { defaultConfig } from '../configuration/configuration';
import { ChannelClient, IdentityClient } from 'iota-is-sdk';
import { HttpModule } from '@nestjs/axios';

@Module({
	imports: [
		HttpModule,
		MongooseModule.forFeature([
			{ name: DeviceRegistration.name, schema: DeviceRegistrationSchema },
			{ name: ChannelInfo.name, schema: ChannelInfoSchema }
		])
	],
	controllers: [DeviceRegistrationController],
	providers: [
		DeviceRegistrationService,
		ConfigService,
		{ provide: 'OwnerClient', useValue: new ChannelClient(defaultConfig) },
		{ provide: 'UserClient', useValue: new ChannelClient(defaultConfig) },
		{ provide: 'IdentityClient', useValue: new IdentityClient(defaultConfig) }
	]
})
export class DeviceRegistrationModule {}
