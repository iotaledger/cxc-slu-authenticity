import { Body, Controller, Get, Param, ParseEnumPipe, Post, Put, UsePipes } from '@nestjs/common';
import { Status } from './model/Status';
import { SluStatusValidationPipe } from './pipes/slu-status-validation.pipe';
import { SluStatus } from './schema/slu-status.schema';
import { SluStatusService } from './slu-status.service';

@Controller('/api/v1/status')
export class SluStatusController {
	constructor(private statusService: SluStatusService) {}

	@Post('/:id/:channel')
	@UsePipes(new SluStatusValidationPipe())
	async createSluStatus(@Body() body, @Param('id') id: string, @Param('channel') channel: string): Promise<SluStatus> {
		return await this.statusService.saveSluStatus(body.status, id, channel);
	}

	@Put('/:id/:status')
	async updateSluStatus(@Param('id') id: string, @Param('status', new ParseEnumPipe(Status)) status: Status): Promise<SluStatus> {
		return await this.statusService.updateSluStatus(id, status);
	}

	@Get('/:id')
	async getStatusInfo(@Param('id') id: string): Promise<string> {
		return await this.statusService.getSluStatus(id);
	}
}
