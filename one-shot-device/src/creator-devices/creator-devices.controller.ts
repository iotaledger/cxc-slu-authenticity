import { Controller, Get, Param} from '@nestjs/common';
import { CreatorDevicesService } from './creator-devices.service';
import { CreatorDevice } from './schema/creator-devices.schema';

@Controller('api/v1/creator-devices')
export class CreatorDevicesController {

    constructor(private creatorDevicesService: CreatorDevicesService) { }

    @Get('/:creator')
    async getCreatorDevices(@Param('creator') creator: string): Promise<CreatorDevice[]> {
        return await this.creatorDevicesService.getAllDevices(creator);
    }
}

