import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SluNonce } from './schema/slu-nonce.schema';
import { Model } from 'mongoose';
import { SluNonceDto } from './model/slu-nonce.dto';
import { DeleteResult } from 'mongodb';

@Injectable()
export class SluNonceService {
	constructor(@InjectModel(SluNonce.name) private sluNonce: Model<SluNonce>) {}

	async saveSluNonce(sluNonce: SluNonceDto): Promise<SluNonce> {
		const result = (await new this.sluNonce(sluNonce).save()).toObject();
		delete result._id;
		return result;
	}

	async getSluNonce(sluId: string, creator: string): Promise<SluNonce> {
		const sluNonce: SluNonce = await this.sluNonce.findOne({ sluId }, { _id: 0 }).lean();
		if (sluNonce.creator.trim() === creator.trim()) return sluNonce;
		sluNonce.nonce = '';
		return sluNonce;
	}

	async deleteSluNonce(sluId: string, creator: string): Promise<DeleteResult> {
		const sluNonce: SluNonce = await this.sluNonce.findOne({ sluId }).lean();
		if (sluNonce.creator.trim() === creator.trim()) {
			return await this.sluNonce.deleteOne({ sluId }).lean();
		} else {
			throw new UnauthorizedException('not the creator of slu-nonce');
		}
	}

	async getSluNonces(sluNonces: string[], creator: string): Promise<SluNonce[]> {
		const sluNoncesDb: SluNonce[] = await this.sluNonce.find({ sluId: { $in: sluNonces } }, { _id: 0 }).lean();
		sluNoncesDb.forEach((sluNonce) => {
			if (sluNonce.creator.trim() !== creator.trim()) {
				sluNonce.nonce = '';
			}
		});
		return sluNoncesDb;
	}
}
