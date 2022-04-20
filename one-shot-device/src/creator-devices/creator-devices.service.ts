import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatorDevice, CreatorDeviceDocument } from './schema/creator-devices.schema';
import { Model } from 'mongoose';

@Injectable()
export class CreatorDevicesService {

    constructor(@InjectModel(CreatorDevice.name) private creatorDeviceModel: Model<CreatorDeviceDocument>) { }

    async saveCreatorDevice(creatorDevice: CreatorDevice): Promise<CreatorDevice> {
        return (await new this.creatorDeviceModel(creatorDevice).save()).toObject();
    }

    async getAllDevices(creator: string): Promise<CreatorDevice[]> {
        return await this.creatorDeviceModel.find({ creator }).lean();
    }
}
