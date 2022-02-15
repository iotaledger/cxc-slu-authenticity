import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { DeviceRegistrationController } from './device-registration.controller';
import { DeviceRegistrationService } from './device-registration.service';
import {
  DeviceRegistrationSchema,
  DeviceRegistration,
} from './schemas/device-registration.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceRegistration.name, schema: DeviceRegistrationSchema },
    ]),
  ],
  controllers: [DeviceRegistrationController],
  providers: [DeviceRegistrationService, ConfigService],
})
export class DeviceRegistrationModule {}
