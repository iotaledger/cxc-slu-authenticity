import { Contains, IsNotEmpty, IsString } from 'class-validator';

export class SluDataDto {
	@IsNotEmpty()
	payload: any;

	@IsNotEmpty()
	@IsString()
	@Contains('did:iota:')
	deviceId: string;
}
