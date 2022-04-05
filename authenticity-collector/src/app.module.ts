import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityModule } from './identity/identity.module';
import { ChannelSubscriptionService } from './services/channel-subscription/channel-subscription.service';
import { SludataModule } from './sludata/sludata.module';
import { ChannelClient, IdentityClient } from 'iota-is-sdk/lib';
import { defaultConfig } from './configuration';
import { CollectorIdentityService } from './services/collector-identity/collector-identity.service';

@Module({
	imports: [
		IdentityModule,
		SludataModule,
		ConfigModule.forRoot({
			isGlobal: true
		}),
		MongooseModule.forRootAsync({
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get<string>('DATABASE_URL'),
				dbName: configService.get<string>('DATABASE_NAME')
			}),
			inject: [ConfigService]
		})
	],
	providers: [
		ChannelSubscriptionService,
		CollectorIdentityService,
		{ provide: 'IdentityClient', useValue: new IdentityClient(defaultConfig) },
		{ provide: 'ChannelClient', useValue: new ChannelClient(defaultConfig) }
	]
})
export class AppModule {}
