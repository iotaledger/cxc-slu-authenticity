import { Contains, IsNotEmpty, IsString } from 'class-validator';

export class SluNonceDto {
	@IsNotEmpty()
	@IsString()
	@Contains('did:iota:', { message: 'wrong DID format' })
	readonly sluId: string;

	@IsNotEmpty()
	@IsString()
	readonly nonce: string;

	@IsNotEmpty()
	@IsString()
	@Contains('did:iota:', { message: 'wrong DID format' })
	readonly creator: string;
}
