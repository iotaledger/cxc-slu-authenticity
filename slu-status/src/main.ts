import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const config = new DocumentBuilder()
		.setTitle('Slu-Status microservice')
		.setDescription('API documentation')
		.addTag('Slu-Status')
		.addTag('Slu-Nonce')
		.setVersion('1.0')
		.addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' })
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/v1/status-docs', app, document);

	await app.listen(process.env.PORT || 3000);
	Logger.log(`SLU-Status running on port ${process.env.PORT}`);
}
bootstrap();
