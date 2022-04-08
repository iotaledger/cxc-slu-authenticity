import { Module } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Identity, IdentitySchema } from './schemas/identity.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
	providers: [IdentityService],
	controllers: [IdentityController],
	imports: [HttpModule, MongooseModule.forFeature([{ name: Identity.name, schema: IdentitySchema }])],
	exports: [IdentityService]
})
export class IdentityModule {}
