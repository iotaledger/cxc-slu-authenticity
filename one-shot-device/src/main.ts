import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const options: SwaggerDocumentOptions = {
		operationIdFactory: (controllerKey: string, methodKey: string) => methodKey
	};

	const config = new DocumentBuilder()
		.setTitle('One-Shot-Device-Api-Reference')
		.setDescription(
			'One-Shot-Device is a microservice that allows the creator to register and authenticate devices for the CityXChange. It uses Integration Services and IOTA SSI.'
		)
		.setVersion('1.0')
		.addTag('one-shot-device')
		.build();

	const document = SwaggerModule.createDocument(app, config, options);
	SwaggerModule.setup('/api/v1/one-shot-device-docs', app, document);

	await app.listen(process.env.PORT || 3000);
	Logger.log(`One Shot Device Registration running on port ${process.env.PORT}`);
}
bootstrap();
