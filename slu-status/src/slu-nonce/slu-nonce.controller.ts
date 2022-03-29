import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SluNonceDto } from './model/slu-nonce.dto';
import { SluNonce } from './schema/slu-nonce.schema';
import { SluNonceService } from './slu-nonce.service';
import { DeleteResult } from 'typeorm';

@Controller('/api/v1/status')
export class SluNonceController {
	constructor(private sluNonceService: SluNonceService) {}

	@Post('/slu-nonce')
	async saveSluNonce(@Body() sluNonceDto: SluNonceDto): Promise<SluNonce> {
		return await this.sluNonceService.saveSluNonce(sluNonceDto);
	}

	@Get('/slu-nonce/:id/:creator')
	async getSluNonce(@Param('id') sluId: string, @Param('creator') creator: string): Promise<SluNonce> {
		return await this.sluNonceService.getSluNonce(sluId, creator);
	}

	@Delete('/slu-nonce/:id/:creator')
	async deleteSluNonce(@Param('id') sluId: string, @Param('creator') creator: string): Promise<DeleteResult> {
		return await this.sluNonceService.deleteSluNonce(sluId, creator);
	}

	@Post('/slu-nonces/:creator')
	async getSluNonces(@Body() sluNonces: string[], @Param('creator') creator: string): Promise<SluNonce[]> {
		return await this.sluNonceService.getSluNonces(sluNonces['sluIds'], creator);
	}
}
