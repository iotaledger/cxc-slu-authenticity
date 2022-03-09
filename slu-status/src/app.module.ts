import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SluStatusModule } from './slu-status/slu-status.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKeyMiddleware } from './middleware/api-key.middleware';

@Module({
	imports: [
		SluStatusModule,
		ConfigModule.forRoot({
			isGlobal: true
		}),
		MongooseModule.forRoot(process.env.DATABASE_URL, { dbName: process.env.DATABASE_NAME })
	]
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(ApiKeyMiddleware).forRoutes('status');
	}
}
