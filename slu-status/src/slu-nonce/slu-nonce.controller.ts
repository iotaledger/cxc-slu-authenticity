import { Body, Controller, Delete, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { SluNonceDto } from './model/slu-nonce.dto';
import { SluNonce } from './schema/slu-nonce.schema';
import { SluNonceService } from './slu-nonce.service';
import { DeleteResult } from 'mongodb';

@Controller('/api/v1/slu-nonce')
export class SluNonceController {
	constructor(private sluNonceService: SluNonceService) {}

	@Post()
	@UsePipes(new ValidationPipe({ transform: true }))
	async saveSluNonce(@Body() sluNonceDto: SluNonceDto): Promise<SluNonce> {
		return await this.sluNonceService.saveSluNonce(sluNonceDto);
	}

	@Get('/:id/:creator')
	async getSluNonce(@Param('id') sluId: string, @Param('creator') creator: string): Promise<SluNonce> {
		return await this.sluNonceService.getSluNonce(sluId, creator);
	}

	@Delete('/:id/:creator')
	async deleteSluNonce(@Param('id') sluId: string, @Param('creator') creator: string): Promise<DeleteResult> {
		return await this.sluNonceService.deleteSluNonce(sluId, creator);
	}

	@Post('/:creator')
	async getSluNonces(@Body() sluNonces: { sluIds: string[] }, @Param('creator') creator: string): Promise<SluNonce[]> {
		return await this.sluNonceService.getSluNonces(sluNonces.sluIds, creator);
	}
}
