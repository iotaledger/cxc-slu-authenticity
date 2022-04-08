import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceRegistrationModule } from './devices/device-registration.module';
import { ConfigService } from '@nestjs/config';
import { CreatorDevicesModule } from './creator-devices/creator-devices.module';

@Module({
	imports: [
		DeviceRegistrationModule,
		ConfigModule.forRoot(),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get<string>('MONGO_URL'),
				dbName: configService.get<string>('DB_NAME')
			}),
			inject: [ConfigService]
		}),
		CreatorDevicesModule
	]
})
export class AppModule {}
