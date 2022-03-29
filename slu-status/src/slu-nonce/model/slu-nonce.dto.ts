import { IsNotEmpty, IsString } from 'class-validator';

export class SluNonceDto {
	@IsNotEmpty()
	@IsString()
	readonly sluId: string;

	@IsNotEmpty()
	@IsString()
	readonly nonce: string;

	@IsNotEmpty()
	@IsString()
	readonly creator: string;
}
