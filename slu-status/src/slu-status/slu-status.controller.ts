import { Body, Controller, Get, Param, ParseEnumPipe, Post, Put } from '@nestjs/common';
import { Status } from './model/Status';
import { SluStatusValidationPipe } from './pipes/slu-status-validation.pipe';
import { SluStatus } from './schema/slu-status.schema';
import { SluStatusService } from './slu-status.service';

@Controller('/api/v1/status')
export class SluStatusController {
	constructor(private statusService: SluStatusService) {}

	@Post()
	async createSluStatus(@Body(new SluStatusValidationPipe()) body): Promise<SluStatus> {
		return await this.statusService.saveSluStatus(body);
	}

	@Put('/:id/:status')
	async updateSluStatus(@Param('id') id: string, @Param('status', new ParseEnumPipe(Status)) status: Status): Promise<SluStatus> {
		return await this.statusService.updateSluStatus(id, status);
	}

	@Get('/:id')
	async getStatusInfo(@Param('id') id: string): Promise<string> {
		return await this.statusService.getSluStatus(id);
	}

	@Post('/statuses')
	async getStatuses(@Body() devices: { id: string[] }): Promise<SluStatus[]> {
		return await this.statusService.getStatuses(devices.id);
	}
}
