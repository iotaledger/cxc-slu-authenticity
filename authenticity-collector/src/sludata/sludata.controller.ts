import { Body, Controller, Post, UsePipes, ValidationPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { SluDataDto } from './model/SluDataDto';
import { SluDataService } from './sludata.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';

@ApiTags('slu-data')
@Controller('/api/v1/authenticity/data')
export class SluDataController {
	constructor(private sluDataService: SluDataService) {}

	@Post()
	@ApiResponse({
		status: 201,
		description: 'Sending authentication proof was successful',
		schema: {
			example: {
				payload: {
					hashedData: `U2FsdGVkX199lBknVEUkXZvpyPu+Gcz1hiEVjtNAywwC12yvuY+Vbca50pVhbfA4`,
					deviceId: 'did:iota:12345'
				}
			}
		}
	})
	@ApiResponse({
		status: 409,
		description: 'authentication prove expired'
	})
	@ApiNotFoundResponse({ description: 'authentication prove not found in the collection' })
	@ApiInternalServerErrorResponse({
		description: 'Internal server error'
	})
	@ApiOperation({ summary: 'Send the authentication proof' })
	@ApiBody({
		type: SluDataDto,
		examples: {
			sluData: {
				summary: 'Request body with SluDataDTO',
				value: {
					payload: {
						hashedData: `U2FsdGVkX199lBknVEUkXZvpyPu+Gcz1hiEVjtNAywwC12yvuY+Vbca50pVhbfA4`,
						deviceId: 'did:iota:12345'
					}
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
