import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 8080);
  console.log(
    `Integration Service One Shot Device Registration running on: ${await app.getUrl()}`,
  );
}
bootstrap();
