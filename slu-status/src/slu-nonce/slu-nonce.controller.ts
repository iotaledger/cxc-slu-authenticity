import { Body, Controller, Delete, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { SluNonceDto } from './model/slu-nonce.dto';
import { SluNonce } from './schema/slu-nonce.schema';
import { SluNonceService } from './slu-nonce.service';
import { DeleteResult } from 'mongodb';
import { ApiOperation, ApiResponse, ApiBody, ApiTags, ApiParam, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Slu-Nonce')
@ApiSecurity('X-API-KEY')
@Controller('/api/v1/slu-nonce')
export class SluNonceController {
	constructor(private sluNonceService: SluNonceService) { }

	@Post()
	@ApiOperation({ summary: 'Create slu-nonce.' })
	@ApiBody({
		type: SluNonceDto,
		examples: {
			sluStatus: {
				summary: 'Post body with SluNonceDTO',
				description: 'For saving the slu-nonce entry for a device.',
				value: {
					sluId: 'did:iota:12345',
					nonce: '94ac7722-00c2-45f9-a77d-30a218558cea',
					creator: 'did:iota:54321'
				} as SluNonceDto
			}
		}
	})
	@ApiResponse({
		status: 201,
		description: 'Created',
		schema: {
			example: {
				sluId: 'did:iota:12345',
				nonce: '94ac7722-00c2-45f9-a77d-30a218558cea',
				creator: 'did:iota:54321'
			}
		}
	})
	@UsePipes(new ValidationPipe({ transform: true }))
	async saveSluNonce(@Body() sluNonceDto: SluNonceDto): Promise<SluNonce> {
		return await this.sluNonceService.saveSluNonce(sluNonceDto);
	}

	@Get('/:id/:creator')
	@ApiOperation({ summary: 'Return slu-nonce.' })
	@ApiParam({
		description: 'id of the device which nonce should be returned.',
		example: 'did:iota:12345',
		name: 'id'
	})
	@ApiParam({
		description: 'id of the creator of the device.',
		example: 'did:iota:54321',
		name: 'creator'
	})
	@ApiResponse({
		status: 200,
		description: 'Returns the saved slu-nonce object. If the creator parameter is not the one of the device the nonce property is empty.',
		schema: {
			example: {
				sluId: 'did:iota:12345',
				nonce: '94ac7722-00c2-45f9-a77d-30a218558cea',
				creator: 'did:iota:54321'
			}
		}
	})
	async getSluNonce(@Param('id') sluId: string, @Param('creator') creator: string): Promise<SluNonce> {
		return await this.sluNonceService.getSluNonce(sluId, creator);
	}

	@Delete('/:id/:creator')
	@ApiOperation({ summary: 'Delete slu-nonce.' })
	@ApiParam({
		description: 'id of the device which nonce should be deleted.',
		example: 'did:iota:12345',
		name: 'id'
	})
	@ApiParam({
		description: 'id of the creator of the device.',
		example: 'did:iota:54321',
		name: 'creator'
	})
	@ApiResponse({
		status: 200,
		description: 'Deleted',
		schema: {
			example: {
				acknowledged: true,
				deletedCount: 1
			}
		}
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
		schema: {
			example: {
				error: 'not the creator of slu-nonce'
			}
		}
	})
	async deleteSluNonce(@Param('id') sluId: string, @Param('creator') creator: string): Promise<DeleteResult> {
		return await this.sluNonceService.deleteSluNonce(sluId, creator);
	}

	@Post('/:creator')
	@ApiOperation({ summary: 'Return slu-nonces for a list of ids.' })
	@ApiParam({
		description: 'id of the creator.',
		example: 'did:iota:12345',
		name: 'creator'
	})
	@ApiBody({
		type: String,
		examples: {
			devices: {
				summary: 'Request body with a list of device ids',
				description: 'For filtering the database by these ids.',
				value: {
					sluIds: ['did:iota:12345', 'did:iota:54321']
				}
			}
		}
	})
	@ApiResponse({
		status: 200,
		description: 'Ok',
		schema: {
			example: [
				{
					sluId: 'did:iota:12345',
					nonce: '94ac7722-00c2-45f9-a77d-30a218558cea',
					creator: 'did:iota:54321'
				},
				{
					id: 'did:iota:54321',
					nonce: '',
					creator: 'did:iota:84321'
				}
			]
		}
	})
	async getSluNonces(@Body() sluNonces: { sluIds: string[] }, @Param('creator') creator: string): Promise<SluNonce[]> {
		return await this.sluNonceService.getSluNonces(sluNonces.sluIds, creator);
	}
}
