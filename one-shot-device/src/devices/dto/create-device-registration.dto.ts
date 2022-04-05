import { Encoding as encoding } from 'iota-is-sdk/lib/models/schemas/identity';
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

export class IdentityKeyData {
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
	@IsNotEmpty()
	@IsString()
	readonly subscriptionLink: string;
	@IsNotEmpty()
	@IsString()
	readonly seed: string;
	@Type(() => IdentityKeyData)
	@ValidateNested({ each: true })
	readonly identityKey: IdentityKeyData;
}
