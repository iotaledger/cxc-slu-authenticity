import { Encoding } from '@iota/is-shared-modules/lib/models/schemas/identity';
import { IsEnum, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class IdentityKeyObject {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	readonly type: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	readonly public: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	readonly secret: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsEnum(Encoding)
	readonly encoding: Encoding;
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
