import { Contains, IsDate, IsNotEmpty, IsString } from 'class-validator';
export class IdentityDto {
	@IsNotEmpty()
	@IsString()
	@Contains('did:iota:')
	did: string;

	@IsNotEmpty()
	@IsDate()
	timestamp: Date;

	@IsNotEmpty()
	@IsString()
	signature: string;
}
