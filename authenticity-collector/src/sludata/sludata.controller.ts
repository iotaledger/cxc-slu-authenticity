import { Body, Controller, Post } from '@nestjs/common';
import { ChannelData } from 'iota-is-sdk/lib';
import { SluDataDto } from './model/SluDataDto';
import { SludataService } from './sludata.service';

@Controller('sludata')
export class SludataController {
    
    constructor(private sludataService: SludataService){}

    @Post('data')
    async writeData(@Body() sluData: SluDataDto): Promise<ChannelData>{
        return await this.sludataService.writeData(sluData);
    }
}
