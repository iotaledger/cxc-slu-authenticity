import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IdentityKeyData } from '../dto/create-device-registration.dto';

export type DeviceRegistrationDocument = DeviceRegistration & Document;

@Schema({ collection: 'slu-bootstrap', versionKey: false })
export class DeviceRegistration {
	@Prop({ required: true })
	nonce: string;

	@Prop({ required: true })
	identityKey: IdentityKeyData;

	@Prop({ required: true })
	channelSeed: string;

	@Prop({ required: true })
	channelAddress: string;

	@Prop({ required: true })
	subscriptionLink: string;
}

export const DeviceRegistrationSchema = SchemaFactory.createForClass(DeviceRegistration);
