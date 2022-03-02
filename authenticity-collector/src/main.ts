import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { channelSubscription } from './channel-subscription/channelSubscription';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	await app.listen(process.env.port || 4000);
	channelSubscription();
}

bootstrap();
