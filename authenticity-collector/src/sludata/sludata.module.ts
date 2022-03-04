import { Module } from '@nestjs/common';
import { SludataController } from './sludata/sludata.controller';
import { SludataService } from './sludata/sludata.service';

@Module({
  controllers: [SludataController],
  providers: [SludataService]
})
export class SludataModule {}
