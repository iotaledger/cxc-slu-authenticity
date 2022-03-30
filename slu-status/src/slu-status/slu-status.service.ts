import { Injectable } from '@nestjs/common';
import { SluStatusDto } from './model/SluStatusDto';
import { SluStatus, SluStatusDocument } from './schema/slu-status.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Status } from './model/Status';

@Injectable()
export class SluStatusService {
	constructor(@InjectModel(SluStatus.name) private sluStatusModel: Model<SluStatus>) {}

	async saveSluStatus(status: Status, id: string, channelAddress: string): Promise<SluStatusDocument> {
		const sluStatusDto: SluStatusDto = {
			id,
			status,
			channelAddress
		};
		return await new this.sluStatusModel(sluStatusDto).save();
	}

	async updateSluStatus(id: string, status: Status): Promise<SluStatusDocument> {
		return await this.sluStatusModel.findOneAndUpdate({ id }, { status }, { new: true, fields: { _id: 0 } });
	}

	async getSluStatus(id: string): Promise<string> {
		const slu = await this.sluStatusModel.findOne({ id }).lean();
		return slu?.status;
	}
}
