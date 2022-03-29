import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SluStatusModule } from './slu-status/slu-status.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKeyMiddleware } from './middleware/api-key.middleware';
import { SluNonceModule } from './slu-nonce/slu-nonce.module';

@Module({
	imports: [
		SluNonceModule,
		SluStatusModule,
		ConfigModule.forRoot({
			isGlobal: true
		}),
		MongooseModule.forRootAsync({
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get<string>('DATABASE_URL'),
				dbName: configService.get<string>('DATABASE_NAME')
			}),
			inject: [ConfigService]
		})
	]
})
export class AppModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(ApiKeyMiddleware).forRoutes('status');
	}
}
