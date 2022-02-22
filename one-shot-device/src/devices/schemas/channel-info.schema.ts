import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type ChannelInfoDocument = ChannelInfo & Document;

@Schema({ collection: 'slu-bootstrap-channel-info', versionKey: false })
export class ChannelInfo extends Document {
	@Prop({ required: true })
	channelId: string;

	@Prop({ required: true })
	channelSeed: string;
}
export const ChannelInfoSchema = SchemaFactory.createForClass(ChannelInfo);
