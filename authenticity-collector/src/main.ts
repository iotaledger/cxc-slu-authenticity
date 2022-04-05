import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ChannelSubscriptionService } from './services/channel-subscription/channel-subscription.service';
import { CollectorIdentityService } from './services/collector-identity/collector-identity.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	await app.listen(process.env.port || 3000);

	const collectorIdentityService = app.get(CollectorIdentityService);
	collectorIdentityService.checkCollectorIdentity();

	const channelSubscription = app.get(ChannelSubscriptionService);
	channelSubscription.channelSubscription();
}

bootstrap();
