import { SluStatusDto } from './model/SluStatusDto';
import { Status } from './model/Status';
import { SluStatus } from './schema/slu-status.schema';
import { SluStatusService } from './slu-status.service';
export declare class SluStatusController {
    private statuService;
    constructor(statuService: SluStatusService);
    createSluStatus(body: SluStatusDto): Promise<SluStatus>;
    updateSluStatus(id: string, status: Status): Promise<SluStatus>;
    getStatusInfo(id: string): Promise<string>;
}
