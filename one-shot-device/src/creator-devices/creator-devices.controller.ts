import { Controller, Get, Param } from '@nestjs/common';
import { CreatorDevicesService } from './creator-devices.service';
import { CreatorDevice } from './schema/creator-devices.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiNotFoundResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';

@ApiTags('one-shot-device')
@Controller('api/v1/creator-devices')
export class CreatorDevicesController {
	constructor(private creatorDevicesService: CreatorDevicesService) {}

	@Get('/:creator')
	@ApiResponse({
		description: 'Devices list loaded successfully'
	})
	@ApiNotFoundResponse({ description: 'Failed to load devices' })
	@ApiInternalServerErrorResponse({
		description: 'Internal server error'
	})
	@ApiOperation({ summary: 'Show all manager devices' })
	async getCreatorDevices(@Param('creator') creator: string): Promise<CreatorDevice[]> {
		return await this.creatorDevicesService.getAllDevices(creator);
	}
}
