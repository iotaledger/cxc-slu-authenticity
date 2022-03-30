import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SluNonceDocument = SluNonce & Document;

@Schema({ collection: 'slu-nonce', versionKey: false })
export class SluNonce {
	@Prop({ required: true })
	sluId: string;

	@Prop({ required: true })
	nonce: string;

	@Prop({ required: true })
	creator: string;
}

export const SluNonceSchema = SchemaFactory.createForClass(SluNonce);
