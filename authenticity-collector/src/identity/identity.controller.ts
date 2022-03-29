import { Body, Controller, Get, Post, Query, UsePipes } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { IdentityDto } from './models/IdentityDto';
import { IdentityValidationPipe } from './pipes/identity-validation.pipe';
import { Identity } from './schemas/identity.schema';

@Controller('/api/v1/authenticity')
export class IdentityController {
	constructor(private identityService: IdentityService) {}

	@Get('/prove')
	async getAuthProves(@Query() query): Promise<Identity[]> {
		return await this.identityService.getAuthProves(query.did, query.from, query.to);
	}

	@Post('/prove')
	@UsePipes(new IdentityValidationPipe())
	async saveSlu(@Body() body: IdentityDto): Promise<Identity> {
		return await this.identityService.proveAndSaveSlu(body);
	}
}
