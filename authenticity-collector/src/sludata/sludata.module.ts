import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { SludataController } from './sludata.controller';
import { SludataService } from './sludata.service';

@Module({
	imports: [HttpModule, IdentityModule],
	controllers: [SludataController],
	providers: [SludataService]
})
export class SludataModule {}
