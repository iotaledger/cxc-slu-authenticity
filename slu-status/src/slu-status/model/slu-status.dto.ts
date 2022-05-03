import { Contains, IsNotEmpty, IsString } from 'class-validator';
import { Status } from './Status';
import { ApiProperty } from '@nestjs/swagger';

export class SluStatusDto {
	@IsNotEmpty()
	@IsString()
	@Contains('did:iota:')
	id: string;

	@IsNotEmpty()
	@IsString({ message: "Status must be either 'created' or 'installed'" })
	@ApiProperty({ enum: Status })
	status: Status;

	@IsNotEmpty()
	@IsString()
	@ApiProperty()
	channelAddress: string;
}
