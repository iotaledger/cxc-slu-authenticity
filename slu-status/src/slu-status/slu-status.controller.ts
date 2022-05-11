import { Body, Controller, Get, Param, ParseEnumPipe, Post, Put } from '@nestjs/common';
import { SluStatusDto } from './model/slu-status.dto';
import { Status } from './model/Status';
import { SluStatusValidationPipe } from './pipes/slu-status-validation.pipe';
import { SluStatus } from './schema/slu-status.schema';
import { SluStatusService } from './slu-status.service';
import { ApiOperation, ApiResponse, ApiBody, ApiTags, ApiParam, ApiSecurity } from '@nestjs/swagger';

@ApiTags('Slu-Status')
@ApiSecurity('X-API-KEY')
@Controller('/api/v1/status')
export class SluStatusController {
	constructor(private statusService: SluStatusService) { }

	@Post()
	@ApiOperation({ summary: 'Create slu-status.' })
	@ApiBody({
		type: SluStatusDto,
		examples: {
			sluStatus: {
				summary: 'Request body with SluStatusDTO',
				description: 'For saving one slu-status entry for a device.',
				value: {
					id: 'did:iota:12345',
					status: 'created',
					channelAddress: '4bece03400fc8c208e4e1499b5268149f95d0af626ebad76c1050eadc2c7485b0000000000000000:c728a1d868f544f37812cc96'
				} as SluStatusDto
			}
		}
	})
	@ApiResponse({
		status: 201,
		description: 'Created',
		schema: {
			example: {
				_id: `ObjectId("00000020f51bb4362eee2a4d")`,
				id: 'did:iota:12345',
				status: 'created',
				channelAddress: '4bece03400fc8c208e4e1499b5268149f95d0af626ebad76c1050eadc2c7485b0000000000000000:c728a1d868f544f37812cc96'
			}
		}
	})
	async createSluStatus(@Body(new SluStatusValidationPipe()) body): Promise<SluStatus> {
		return await this.statusService.saveSluStatus(body);
	}

	@Put('/:id/:status')
	@ApiOperation({ summary: 'Update slu-status.' })
	@ApiParam({
		description: 'id of the device which status should be updated.',
		example: 'did:iota:12345',
		name: 'id'
	})
	@ApiParam({
		description: 'The new status which should exchange the current status of the device.',
		example: 'installed',
		name: 'status'
	})
	@ApiResponse({
		status: 201,
		description: 'Created',
		schema: {
			example: {
				id: 'did:iota:12345',
				status: 'installed',
				channelAddress: '4bece03400fc8c208e4e1499b5268149f95d0af626ebad76c1050eadc2c7485b0000000000000000:c728a1d868f544f37812cc96'
			}
		}
	})
	@ApiResponse({
		status: 500,
		description: 'Internal Server Error',
		schema: {
			example: 'Could not find document(s) in the collection.'
		}
	})
	async updateSluStatus(@Param('id') id: string, @Param('status', new ParseEnumPipe(Status)) status: Status): Promise<SluStatus> {
		return await this.statusService.updateSluStatus(id, status);
	}

	@Get('/:id')
	@ApiOperation({ summary: 'Return slu-status.' })
	@ApiParam({
		description: 'id of the device which status should be returned.',
		example: 'did:iota:12345',
		name: 'id'
	})
	@ApiResponse({
		status: 200,
		description: 'Ok',
		schema: {
			example: {
				id: 'did:iota:12345',
				status: 'installed',
				channelAddress: '4bece03400fc8c208e4e1499b5268149f95d0af626ebad76c1050eadc2c7485b0000000000000000:c728a1d868f544f37812cc96'
			}
		}
	})
	@ApiResponse({
		status: 500,
		description: 'Internal Server Error',
		schema: {
			example: 'Could not find document(s) in the collection.'
		}
	})
	async getStatusInfo(@Param('id') id: string): Promise<string> {
		return await this.statusService.getSluStatus(id);
	}

	@Post('/statuses')
	@ApiOperation({ summary: 'Return slu-statuses for a list of ids.' })
	@ApiBody({
		type: String,
		examples: {
			devices: {
				summary: 'Request body with a list of device ids',
				description: 'For filtering the database by these ids.',
				value: {
					id: ['did:iota:12345', 'did:iota:54321']
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
					id: 'did:iota:12345',
					status: 'installed'
				},
				{
					id: 'did:iota:54321',
					status: 'created'
				}
			]
		}
	})
	@ApiResponse({
		status: 500,
		description: 'Internal Server Error',
		schema: {
			example: 'Could not find document(s) in the collection.'
		}
	})
	async getStatuses(@Body() devices: { id: string[] }): Promise<SluStatus[]> {
		return await this.statusService.getStatuses(devices.id);
	}
}
