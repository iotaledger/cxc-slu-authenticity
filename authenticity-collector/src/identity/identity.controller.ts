import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { IdentityDto } from './models/IdentityDto';
import { IdentityValidationPipe } from './pipes/identity-validation.pipe';
import {
	ApiTags,
	ApiOperation,
	ApiBody,
	ApiResponse,
	ApiOkResponse,
	ApiNotFoundResponse,
	ApiInternalServerErrorResponse,
	ApiQuery
} from '@nestjs/swagger';
import { Identity } from './schemas/identity.schema';

@ApiTags('identity')
@Controller('/api/v1/authenticity/prove')
export class IdentityController {
	constructor(private identityService: IdentityService) {}

	@Get()
	@ApiQuery({
		name: 'to',
		description: 'The date to limit the search.',
		type: Date
	})
	@ApiQuery({
		name: 'from',
		description: 'The starting date to filter the database.',
		type: Date
	})
	@ApiQuery({
		name: 'did',
		description: 'The id of the device to receive the authentication proves.',
		type: String
	})
	@ApiOkResponse({
		description: 'Authentication prove read was successful',
		schema: {
			example: {
				did: 'did:iota:12345',
				timestamp: new Date('2022-02-27T13:04:18.559Z'),
				signature: '3MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNH'
			}
		}
	})
	@ApiNotFoundResponse({ description: 'Failed to get authentication prove' })
	@ApiInternalServerErrorResponse({
		description: 'Internal server error'
	})
	@ApiOperation({ summary: 'Get authentication prove' })
	async getAuthProves(@Query() query): Promise<Identity[]> {
		return await this.identityService.getAuthProves(query.did, query.from, query.to);
	}

	@Post()
	@ApiResponse({
		status: 201,
		description: 'Proving and saving device was successful',
		schema: {
			example: {
				did: 'did:iota:12345',
				timestamp: new Date('2022-02-27T13:04:18.559Z'),
				signature: '3MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNH'
			}
		}
	})
	@ApiResponse({
		status: 400,
		description: 'Could not authenticate device'
	})
	@ApiNotFoundResponse({ description: 'authentication prove not found in the collection' })
	@ApiInternalServerErrorResponse({
		description: 'Internal server error'
	})
	@ApiOperation({ summary: 'Send the authentication proof' })
	@ApiBody({
		type: IdentityDto,
		examples: {
			body: {
				summary: 'Request body with identity',
				value: {
					did: 'did:iota:12345',
					timestamp: new Date('2022-02-27T13:04:18.559Z'),
					signature: '3MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNH'
				} as IdentityDto
			}
		}
	})
	@UsePipes(new IdentityValidationPipe())
	async saveSlu(@Body() body: IdentityDto): Promise<Identity> {
		return await this.identityService.proveAndSaveSlu(body);
	}
}
