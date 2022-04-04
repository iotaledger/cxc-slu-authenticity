import { Module } from '@nestjs/common';
import { SluNonce, SluNonceSchema } from './schema/slu-nonce.schema';
import { SluNonceController } from './slu-nonce.controller';
import { SluNonceService } from './slu-nonce.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
	imports: [MongooseModule.forFeature([{ name: SluNonce.name, schema: SluNonceSchema }])],
	controllers: [SluNonceController],
	providers: [SluNonceService]
})
export class SluNonceModule {}
