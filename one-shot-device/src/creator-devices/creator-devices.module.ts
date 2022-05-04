import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreatorDevicesController } from './creator-devices.controller';
import { CreatorDevicesService } from './creator-devices.service';
import { CreatorDevice, CreatorDeviceSchema } from './schema/creator-devices.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: CreatorDevice.name, schema: CreatorDeviceSchema }])],
  controllers: [CreatorDevicesController],
  providers: [CreatorDevicesService],
  exports: [CreatorDevicesService]
})
export class CreatorDevicesModule { }
