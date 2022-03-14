import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityModule } from './identity/identity.module';
import { ChannelSubscriptionService } from './channel-subscription/channel-subscription.service';
import { SludataModule } from './sludata/sludata.module';
import { SluAuthorizationMiddleware } from './middleware/slu-authorization.middleware';

@Module({
	imports: [
		IdentityModule,
		ConfigModule.forRoot({
			isGlobal: true
		}),
		MongooseModule.forRoot(process.env.DATABASE_URL, { dbName: 'slu' }),
		SludataModule
	],
	providers: [ChannelSubscriptionService]
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(SluAuthorizationMiddleware).forRoutes('controller/data');
	}
}
