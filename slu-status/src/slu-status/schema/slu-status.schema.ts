import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Contains } from 'class-validator';
import { Document } from 'mongoose';
import { Status } from '../model/Status';

export type SluStatusDocument = SluStatus & Document;

@Schema({ collection: 'slu_status', versionKey: false })
export class SluStatus {
	@Prop({ required: true, unique: true })
	@Contains('did:iota:')
	id: string;

	@Prop({ required: true })
	status: Status;

	@Prop({ required: true })
	channelAddress: string;
}

export const SluStatusSchema = SchemaFactory.createForClass(SluStatus);
