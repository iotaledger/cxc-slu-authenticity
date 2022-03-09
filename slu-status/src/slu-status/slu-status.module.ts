import { Module } from '@nestjs/common';
import { SluStatusController } from './slu-status.controller';
import { SluStatusService } from './slu-status.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SluStatus, SluStatusSchema } from './schema/slu-status.schema';

@Module({
	imports: [MongooseModule.forFeature([{ name: SluStatus.name, schema: SluStatusSchema }])],
	controllers: [SluStatusController],
	providers: [SluStatusService]
})
export class SluStatusModule {}
