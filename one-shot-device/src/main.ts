import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const config = new DocumentBuilder()
		.setTitle('One-Shot-Device-Api-Reference')
		.setDescription('One-Shot-Device documentation')
		.setVersion('1.0')
		.addTag('one-shot-device')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('one-shot-device-docs', app, document);

	await app.listen(process.env.PORT || 3000);
	Logger.log(`One Shot Device Registration running on port ${process.env.PORT}`);
}
bootstrap();
