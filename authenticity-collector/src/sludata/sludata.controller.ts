import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ChannelData } from 'iota-is-sdk/lib';
import { SluDataDto } from './model/SluDataDto';
import { SludataService } from './sludata.service';

@Controller('/api/v1/authenticity/data')
export class SludataController {
	constructor(private sludataService: SludataService) {}

	@Post()
	@UsePipes(new ValidationPipe({ transform: true }))
	async writeData(@Body() sluData: SluDataDto): Promise<ChannelData> {
		return await this.sludataService.writeData(sluData);
	}
}
