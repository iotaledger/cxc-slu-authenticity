import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CreatorDeviceDocument = CreatorDevice & Document;

@Schema({ collection: 'creator-devices', versionKey: false })
export class CreatorDevice {
	@Prop({ required: true })
	id: string;

	@Prop({ required: true })
	channelAddress: string;

	@Prop({ required: true })
	creator: string;

	@Prop({required: true})
	name: string;

	@Prop({required: true})
	channelName: string;
}

export const CreatorDeviceSchema = SchemaFactory.createForClass(CreatorDevice);

