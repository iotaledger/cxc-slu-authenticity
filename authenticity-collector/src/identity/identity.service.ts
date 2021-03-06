import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Identity, IdentityDocument } from './schemas/identity.schema';
import { Model } from 'mongoose';
import { IdentityDto } from './models/IdentityDto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IdentityService {
	private readonly logger: Logger = new Logger(IdentityService.name);

	constructor(
		private httpService: HttpService,
		private configService: ConfigService,
		@InjectModel(Identity.name) private identityModel: Model<IdentityDocument>
	) {}

	async proveAndSaveSlu(identity: IdentityDto): Promise<Identity> {
		const proveOwnershipUrl = this.configService.get<string>('PROVE_OF_OWNERSHIP_URL');
		const response = await firstValueFrom(
			this.httpService.post(proveOwnershipUrl, {
				did: identity.did,
				timestamp: identity.timestamp.getTime(),
				signature: identity.signature
			})
		);
		if (response.data.success === true && response.data.isVerified) {
			try {
				const model = await new this.identityModel(identity).save();
				return model.toObject();
			} catch (ex: any) {
				this.logger.error('Failed saving identity in database');
				throw new BadRequestException(ex.message);
			}
		}
		if (response.data.error) {
			this.logger.error('Proving identity failed.');
			throw new BadRequestException(response.data.error);
		} else {
			this.logger.error('Verification failed.');
			throw new BadRequestException('Verification failed: wrong signature');
		}
	}

	async getAuthProves(did: string, from: any, to: any): Promise<Identity[]> {
		return await this.identityModel
			.find({
				did: did,
				timestamp: { $gte: new Date(from).toISOString(), $lte: new Date(to).toISOString() }
			})
			.lean();
	}
}
