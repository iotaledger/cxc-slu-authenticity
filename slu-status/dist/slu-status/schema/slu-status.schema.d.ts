/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/connection" />
import { Document } from 'mongoose';
import { Status } from '../model/Status';
export declare type SluStatusDocument = SluStatus & Document;
export declare class SluStatus {
    id: string;
    status: Status;
    channelAddress: string;
}
export declare const SluStatusSchema: import("mongoose").Schema<Document<SluStatus, any, any>, import("mongoose").Model<Document<SluStatus, any, any>, any, any, any>, any, any>;
