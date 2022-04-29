import { Body, Controller, Post, UsePipes, ValidationPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { SluDataDto } from './model/SluDataDto';
import { SluDataService } from './sludata.service';

@Controller('/api/v1/authenticity/data')
export class SluDataController {
	constructor(private sludataService: SluDataService) {}

	@Post()
	@UsePipes(new ValidationPipe({ transform: true }))
	async writeData(@Body() sluData: SluDataDto, @Res() response: Response): Promise<Response> {
		const isApproved = await this.sludataService.checkAuthProve(sluData.deviceId);
		if (isApproved) {
			await this.sludataService.sendDataToConnector(sluData);
			const channelData = await this.sludataService.writeDataToChannel(sluData);
			return response.status(201).json(channelData);
		}
		return response.status(409).send({ error: 'authentication prove expired' });
	}
}
