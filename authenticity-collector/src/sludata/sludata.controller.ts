import { Body, Controller, Post, UsePipes, ValidationPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { SluDataDto } from './model/SluDataDto';
import { SluDataService } from './sludata.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';

@ApiTags('authenticity-collector')
@Controller('/api/v1/authenticity/data')
export class SluDataController {
	constructor(private sluDataService: SluDataService) {}

	@Post()
	@ApiResponse({
		status: 201,
		description: 'Sending authentication proof was successful',
		schema: {
			example: {
				payload: { hashedData: `hashedData`, deviceId: 'did:iota:12345' },
				deviceId: 'did:iota:12345'
			}
		}
	})
	@ApiNotFoundResponse({ description: 'authentication prove not found in the collection' })
	@ApiResponse({
		status: 409,
		description: 'authentication prove expired'
	})
	@ApiInternalServerErrorResponse({
		description: 'Internal server error'
	})
	@ApiOperation({ summary: 'Send the authentication proof' })
	@ApiBody({
		type: SluDataDto,
		examples: {
			sluData: {
				summary: 'Request body with SluDataDTO',
				description: 'Request to send the authentication proof.',
				value: {
					payload: { hashedData: `hashedData`, deviceId: 'did:iota:12345' },
					deviceId: 'did:iota:12345'
				} as SluDataDto
			}
		}
	})
	@UsePipes(new ValidationPipe({ transform: true }))
	async writeData(@Body() sluData: SluDataDto, @Res() response: Response): Promise<Response> {
		const isApproved = await this.sluDataService.checkAuthProve(sluData.deviceId);
		if (isApproved) {
			await this.sluDataService.sendDataToConnector(sluData);
			const channelData = await this.sluDataService.writeDataToChannel(sluData);
			return response.status(201).json(channelData);
		}
		return response.status(409).send({ error: 'authentication prove expired' });
	}
}
