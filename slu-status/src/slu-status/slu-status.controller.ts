import { Body, Controller, Get, Param, ParseEnumPipe, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { IsString } from 'class-validator';
import { SluStatusDto } from './model/SluStatusDto';
import { Status } from './model/Status';
import { SluStatusValidationPipe } from './pipes/slu-status-validation.pipe';
import { SluStatus } from './schema/slu-status.schema';
import { SluStatusService } from './slu-status.service';
import { Contains } from 'class-validator';

@Controller('status')
export class SluStatusController {
	constructor(private statuService: SluStatusService) {}

	@Post()
	@UsePipes(new SluStatusValidationPipe())
	async createSluStatus(@Body() body: SluStatusDto): Promise<SluStatus> {
		return await this.statuService.saveSluStatus(body);
	}

	@Put(':id/:status')
	async updateSluStatus(@Param('id') id: string, @Param('status', new ParseEnumPipe(Status)) status: Status): Promise<SluStatus> {
		return await this.statuService.updateSluStatus(id, status);
	}

	@Get(':id')
	async getStatusInfo(@Param('id') id: string): Promise<string> {
		return await this.statuService.getSluStatus(id);
	}
}
