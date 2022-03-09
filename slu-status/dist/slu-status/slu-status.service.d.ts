import { SluStatusDto } from './model/SluStatusDto';
import { SluStatus, SluStatusDocument } from './schema/slu-status.schema';
import { Model } from 'mongoose';
import { Status } from './model/Status';
export declare class SluStatusService {
    private sluStatusModel;
    private readonly logger;
    constructor(sluStatusModel: Model<SluStatus>);
    saveSluStatus(sluStatus: SluStatusDto): Promise<SluStatusDocument>;
    updateSluStatus(id: string, status: Status): Promise<SluStatusDocument>;
    getSluStatus(id: string): Promise<string>;
}
