import { Body, Controller, Post, UsePipes, ValidationPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { ChannelData } from 'iota-is-sdk/lib';
import { SluDataDto } from './model/SluDataDto';
import { SludataService } from './sludata.service';

@Controller('collector')
export class SludataController {
	constructor(private sludataService: SludataService) { }

	@Post('data')
	@UsePipes(new ValidationPipe({ transform: true }))
	async writeData(@Body() sluData: SluDataDto, @Res() response: Response): Promise<Response> {
		const isApproved = await this.sludataService.checkAuthProve(sluData.deviceId);
		if (isApproved) {
			await this.sludataService.sendDataToConnector(sluData);
			const channelData = await this.sludataService.writeDataToChannel(sluData);
			return response.status(201).json(channelData);
		}
		return response.status(409).send({error: "authentication prove expired"});
	}
}
