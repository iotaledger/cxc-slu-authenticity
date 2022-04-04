import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SluStatusDto } from './model/SluStatusDto';
import { SluStatus, SluStatusDocument } from './schema/slu-status.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Status } from './model/Status';

@Injectable()
export class SluStatusService {
	constructor(@InjectModel(SluStatus.name) private sluStatusModel: Model<SluStatus>) {}

	private readonly logger: Logger = new Logger(SluStatusService.name);

	async saveSluStatus(sluStatus: SluStatusDto): Promise<SluStatusDocument> {
		return await new this.sluStatusModel(sluStatus).save();
	}

	async updateSluStatus(id: string, status: Status): Promise<SluStatusDocument> {
		const updateStatus = await this.sluStatusModel.findOneAndUpdate({ id }, { status }, { new: true, fields: { _id: 0 } });

		if (updateStatus === null) {
			this.logger.error('Document does not exist in the collection');
			throw new HttpException('Could not find document in the collection.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return updateStatus;
	}

	async getSluStatus(id: string): Promise<string> {
		const slu = await this.sluStatusModel.findOne({ id }).lean();

		if (slu === null) {
			this.logger.error('Document do not exist in the collection');
			throw new HttpException('Could not find document in the collection.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return slu?.status;
	}

	async getStatuses(devices: string[]): Promise<SluStatus[]> {
		console.log('devices: ', devices);
		const devicesStatuses = await this.sluStatusModel.find({
			id: {
				$in: devices
			}
		});

		if (devicesStatuses === null) {
			this.logger.error('Document(s) do not exist in the collection');
			throw new HttpException('Could not find document(s) in the collection.', HttpStatus.INTERNAL_SERVER_ERROR);
		}

		return devicesStatuses;
	}
}
