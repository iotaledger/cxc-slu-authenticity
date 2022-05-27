import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ChannelSubscriptionService } from './services/channel-subscription/channel-subscription.service';
import { CollectorIdentityService } from './services/collector-identity/collector-identity.service';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const options: SwaggerDocumentOptions = {
		operationIdFactory: (controllerKey: string, methodKey: string) => methodKey
	};

	const config = new DocumentBuilder()
		.setTitle('Authenticity-Collector-API-Reference')
		.setDescription(
			'Authenticity Collector is a microservice that saves the authentication proof of the devices of CityXChange. Furthermore it writes the sensor data, which is send by the device, to his own channel and sends it also to MPower.'
		)
		.setVersion('1.0')
		.addTag('authenticity-collector')
		.build();

	const document = SwaggerModule.createDocument(app, config, options);
	SwaggerModule.setup('/docs', app, document);

	await app.listen(process.env.PORT || 3000);
	const collectorIdentityService = app.get(CollectorIdentityService);
	await collectorIdentityService.checkCollectorIdentity();

	const channelSubscription = app.get(ChannelSubscriptionService);
	await channelSubscription.channelSubscription();
	Logger.log(`authenticity-collector running on port ${process.env.PORT}`);
}

bootstrap();
