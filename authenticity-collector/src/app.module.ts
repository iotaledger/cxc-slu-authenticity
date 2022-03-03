import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityModule } from './identity/identity.module';
import { ChannelSubscriptionService } from './channel-subscription/channel-subscription.service';

@Module({
	imports: [
		IdentityModule,
		ConfigModule.forRoot({
			isGlobal: true
		}),
		MongooseModule.forRoot(process.env.DATABASE_URL, { dbName: 'slu' })
	],
	providers: [ChannelSubscriptionService]
})
export class AppModule {}
