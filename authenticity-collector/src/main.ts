import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ChannelSubscriptionService } from './channel-subscription/channel-subscription.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	await app.listen(4000);
	const channelSubscription = app.get(ChannelSubscriptionService);
	channelSubscription.channelSubscription();
}

bootstrap();
