import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChannelData } from 'iota-is-sdk/lib';
import { SluDataDto } from './model/SluDataDto';
import { SludataService } from './sludata.service';

@Controller('collector')
export class SludataController {
	constructor(private sludataService: SludataService) {}

	@Post('data')
	@UsePipes(new ValidationPipe({ transform: true }))
	async writeData(@Body() sluData: SluDataDto): Promise<ChannelData> {
		return await this.sludataService.writeData(sluData);
	}
}
