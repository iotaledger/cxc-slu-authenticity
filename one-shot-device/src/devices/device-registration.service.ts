import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { defaultConfig } from '../configuration/configuration';
import { InjectModel } from '@nestjs/mongoose';
import { CreateDeviceRegistrationDto } from './dto/create-device-registration.dto';
import {
  DeviceRegistrationDocument,
  DeviceRegistration,
} from './schemas/device-registration.schema';
import { v4 as uuidv4 } from 'uuid';
import { IdentityClient, ChannelClient } from 'iota-is-sdk';

@Injectable()
export class DeviceRegistrationService {
  constructor(
    @InjectModel(DeviceRegistration.name)
    private readonly deviceRegistrationModel: Model<DeviceRegistrationDocument>,
  ) {}

  async createChannelAndIdentity() {
    const channelClient = new ChannelClient(defaultConfig);
    const identityClient = new IdentityClient(defaultConfig);

    // create device identity
    const deviceIdentity = await identityClient.create(
      'my-device' + Math.ceil(Math.random() * 1000),
    );

    console.log('deviceIdentity: ', deviceIdentity);

    // Authenticate device identity
    await channelClient.authenticate(
      deviceIdentity.doc.id,
      deviceIdentity.key.secret,
    );

    // create new channel
    const newChannel = await channelClient.create({
      topics: [{ type: 'example-data', source: 'data-creator' }],
    });

    console.log('new channel: ', newChannel);

    const dto: CreateDeviceRegistrationDto = {
      nonce: uuidv4(),
      channelId: newChannel.channelAddress,
      channelSeed: newChannel.seed,
      identityKeys: {
        id: deviceIdentity.doc.id,
        key: deviceIdentity.key,
      },
    };
    const doc = await this.deviceRegistrationModel.create(dto);
    await doc.save();
  }

  async getRegisteredDevice(nonce) {
    const response = await this.deviceRegistrationModel.findOne({ nonce });
    await this.deviceRegistrationModel.findOneAndDelete({ nonce }).exec();
    return response;
  }
}
