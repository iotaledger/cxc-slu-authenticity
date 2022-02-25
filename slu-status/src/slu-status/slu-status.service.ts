import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SluStatusDto } from './model/SluStatusDto';
import { SluStatus } from './schema/slu-status.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Status } from './model/Status';

@Injectable()
export class SluStatusService {
	private readonly logger = new Logger(SluStatusService.name);

	constructor(@InjectModel(SluStatus.name) private sluStatusModel: Model<SluStatus>) {}

	async saveSluStatus(sluStatus: SluStatusDto): Promise<SluStatus> {
		try {
			const savedSluStatus = (await new this.sluStatusModel(sluStatus).save()).toObject();
			delete savedSluStatus._id;
			return savedSluStatus;
		} catch (ex: any) {
			this.logger.error(ex.message);
			throw new BadRequestException(ex.message);
		}
	}
	async updateSluStatus(id: string, status: Status): Promise<SluStatus> {
		try {
			const updatedSluStatus = (await this.sluStatusModel.findOneAndUpdate({ id: id }, { status: status }, { new: true })).toObject();
			delete updatedSluStatus._id;
			return updatedSluStatus;
		} catch (ex: any) {
			this.logger.error(ex.message);
			throw new BadRequestException(ex);
		}
	}
	async getSluStatus(id: string): Promise<string> {
		try {
			const slu = await this.sluStatusModel.find({ id: id }).lean();
			return slu[0].status;
		} catch (ex: any) {
			this.logger.error(ex.message);
			throw new BadRequestException(ex);
		}
	}
}
