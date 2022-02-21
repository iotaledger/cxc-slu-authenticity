import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	await app.listen(process.env.PORT || 8080);
	Logger.log(`One Shot Device Registration running on: ${await app.getUrl()}`);
}
bootstrap();