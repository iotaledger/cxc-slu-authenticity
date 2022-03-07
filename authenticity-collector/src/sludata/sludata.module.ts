import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SludataController } from './sludata.controller';
import { SludataService } from './sludata.service';

@Module({
	imports: [HttpModule],
	controllers: [SludataController],
	providers: [SludataService]
})
export class SludataModule {}
