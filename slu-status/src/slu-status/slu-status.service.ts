import { Injectable, Logger } from '@nestjs/common';
import { SluStatusDto } from './model/SluStatusDto';
import { SluStatus, SluStatusDocument } from './schema/slu-status.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Status } from './model/Status';

@Injectable()
export class SluStatusService {
	private readonly logger = new Logger(SluStatusService.name);

	constructor(@InjectModel(SluStatus.name) private sluStatusModel: Model<SluStatus>) {}

	async saveSluStatus(status: Status, id: string, channel: string): Promise<SluStatusDocument> {
		const sluStatusDto: SluStatusDto = {
			id,
			status,
			channelAddress: channel
		};
		return await new this.sluStatusModel(sluStatusDto).save();
	}

	async updateSluStatus(id: string, status: Status): Promise<SluStatusDocument> {
		return await this.sluStatusModel.findOneAndUpdate({ id }, { status }, { new: true, fields: { _id: 0 } });
	}

	async getSluStatus(id: string): Promise<string> {
		const slu = await this.sluStatusModel.find({ id }, undefined, { fields: { _id: 0 } }).lean();
		return slu[0]?.status;
	}
}
