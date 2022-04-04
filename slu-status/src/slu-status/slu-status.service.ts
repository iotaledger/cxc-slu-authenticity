import { Injectable } from '@nestjs/common';
import { SluStatusDto } from './model/SluStatusDto';
import { SluStatus, SluStatusDocument } from './schema/slu-status.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Status } from './model/Status';

@Injectable()
export class SluStatusService {
	constructor(@InjectModel(SluStatus.name) private sluStatusModel: Model<SluStatus>) {}

	async saveSluStatus(sluStatus: SluStatusDto): Promise<SluStatusDocument> {
		return await new this.sluStatusModel(sluStatus).save();
	}

	async updateSluStatus(id: string, status: Status): Promise<SluStatusDocument> {
		return await this.sluStatusModel.findOneAndUpdate({ id }, { status }, { new: true, fields: { _id: 0 } });
	}

	async getSluStatus(id: string): Promise<string> {
		const slu = await this.sluStatusModel.findOne({ id }).lean();
		return slu?.status;
	}

	async getStatuses(body: []): Promise<any> {
		// TODO: change the Promise to act type
		// const devices = body;
		const devices = ['did:iota:EQsp4DwvBhUXxD8iheUKfjrd5CQw3q85mUh1pA72qPug', 'did:iota:E37pMbfkauJnHtY7fq2QsmGtqgHryrLrQxMh8zWuo7p3'];

		const devicesStatuses = await this.sluStatusModel.find({
			_id: {
				$in: devices
			}
		});

		return devicesStatuses;
	}
}
