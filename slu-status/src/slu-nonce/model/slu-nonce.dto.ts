import { Contains, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SluNonceDto {
	@IsNotEmpty()
	@IsString()
	@Contains('did:iota:', { message: 'wrong DID format' })
	@ApiProperty()
	readonly sluId: string;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	readonly nonce: string;

	@IsNotEmpty()
	@IsString()
	@Contains('did:iota:', { message: 'wrong DID format' })
	@ApiProperty()
	readonly creator: string;
}
