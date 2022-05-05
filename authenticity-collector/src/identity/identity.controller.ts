import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { IdentityDto } from './models/IdentityDto';
import { IdentityValidationPipe } from './pipes/identity-validation.pipe';
import {
	ApiTags,
	ApiOperation,
	ApiBody,
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
	@ApiOkResponse({
		description: 'Authentication prove read was successful'
		// schema: {
		// 	example: {
		// 		payload: { hashedData: `hashedData`, deviceId: 'did:iota:12345' },
		// 		deviceId: 'did:iota:12345'
		// 	}
		// }
	})
	@ApiOperation({ summary: 'Get authentication prove', notes: 'Search for the authenticated device and returns a device if authenticated' })
	@ApiQuery()
	async getAuthProves(@Query() query): Promise<Identity[]> {
		return await this.identityService.getAuthProves(query.did, query.from, query.to);
	}

	@Post()
	@UsePipes(new IdentityValidationPipe())
	async saveSlu(@Body() body: IdentityDto): Promise<Identity> {
		return await this.identityService.proveAndSaveSlu(body);
	}
}
