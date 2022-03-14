import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IdentityKeysData } from '../dto/create-device-registration.dto';

export type DeviceRegistrationDocument = DeviceRegistration & Document;

@Schema({ collection: 'slu-bootstrap', versionKey: false })
export class DeviceRegistration extends Document {
	@Prop({ required: true })
	nonce: string;

	@Prop({ required: true })
	identityKeys: IdentityKeysData;
}

export const DeviceRegistrationSchema = SchemaFactory.createForClass(DeviceRegistration);
