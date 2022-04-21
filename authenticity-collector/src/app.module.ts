import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityModule } from './identity/identity.module';
import { ChannelSubscriptionService } from './services/channel-subscription/channel-subscription.service';
import { SludataModule } from './sludata/sludata.module';
import { ChannelClient, IdentityClient } from '@iota/is-client';
import { defaultConfig } from './configuration';
import { CollectorIdentityService } from './services/collector-identity/collector-identity.service';
import { SluAuthorizationMiddleware } from './middleware/slu-authorization.middleware';
import { HttpModule } from '@nestjs/axios';

@Module({
	imports: [
		IdentityModule,
		HttpModule,
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
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(SluAuthorizationMiddleware).forRoutes('/api/v1/authenticity/data');
	}
}
