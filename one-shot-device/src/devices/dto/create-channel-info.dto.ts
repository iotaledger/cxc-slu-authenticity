import { IsNotEmpty, IsString } from 'class-validator';

export class SaveChannelDto {
	@IsNotEmpty()
	@IsString()
	readonly channelId: string;

	@IsNotEmpty()
	@IsString()
	readonly channelSeed: string;
}
