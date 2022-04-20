import { Contains, IsNotEmpty, IsString } from 'class-validator';
import { Status } from './Status';

export class SluStatusDto {
	@IsNotEmpty()
	@IsString()
	@Contains('did:iota:')
	id: string;

	@IsNotEmpty()
	@IsString({ message: "Status must be either 'created' or 'installed'" })
	status: Status;

	@IsNotEmpty()
	@IsString()
	channelAddress: string;
}
