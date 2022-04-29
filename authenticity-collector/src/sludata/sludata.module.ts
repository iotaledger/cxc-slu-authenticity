import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { SluDataController } from './sludata.controller';
import { SluDataService } from './sludata.service';

@Module({
	imports: [HttpModule, IdentityModule],
	controllers: [SluDataController],
	providers: [SluDataService]
})
export class SludataModule {}
