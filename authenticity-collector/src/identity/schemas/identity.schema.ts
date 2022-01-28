import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IdentityDocument = Identity & Document;

@Schema({collection: 'slu_devices', versionKey: false})
export class Identity {

    @Prop({required: true})
    did: string;

    @Prop({required: true})
    timestamp: Date;

    @Prop({required: true})
    signature: string;
}

export const IdentitySchema = SchemaFactory.createForClass(Identity);