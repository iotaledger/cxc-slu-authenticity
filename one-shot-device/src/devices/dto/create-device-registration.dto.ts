import { Encoding as encoding } from '../../../node_modules/iota-is-sdk/lib/models/schemas/identity';
import { IsEnum, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
export class IdentityKeyObject {
	@IsNotEmpty()
	@IsString()
	readonly type: string;

	@IsNotEmpty()
	@IsString()
	readonly public: string;
	@IsNotEmpty()
	@IsString()
	readonly secret: string;
	@IsNotEmpty()
	@IsEnum(encoding)
	readonly encoding: encoding;
}

export class IdentityKeysData {
	@IsNotEmpty()
	@IsString()
	readonly id: string;
	@IsNotEmpty()
	@IsObject()
	readonly key: IdentityKeyObject;
}
export class CreateDeviceRegistrationDto {
	@IsNotEmpty()
	@IsString()
	readonly nonce: string;

	@Type(() => IdentityKeysData)
	@ValidateNested({ each: true })
	readonly identityKeys: IdentityKeysData;
}
