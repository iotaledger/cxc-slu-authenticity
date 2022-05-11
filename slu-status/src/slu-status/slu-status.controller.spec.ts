import { Test, TestingModule } from '@nestjs/testing';
import { SluStatusDto } from './model/slu-status.dto';
import { SluStatus, SluStatusDocument, SluStatusSchema } from './schema/slu-status.schema';
import { SluStatusController } from './slu-status.controller';
import { SluStatusService } from './slu-status.service';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import { Status } from './model/Status';

describe('StatusController', () => {
	let controller: SluStatusController;
	let service: SluStatusService;
	let body: SluStatusDto;
	let devices: { id: string; status: string }[];
	let ids: { id: string[] };
	let response: SluStatusDocument;
	let mongod: MongoMemoryServer;
	let connection: Connection;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				MongooseModule.forRootAsync({
					useFactory: async () => {
						mongod = await MongoMemoryServer.create();
						const mongoUri = mongod.getUri();
						return {
							uri: mongoUri
						};
					}
				}),
				MongooseModule.forFeature([{ name: SluStatus.name, schema: SluStatusSchema }])
			],
			controllers: [SluStatusController],
			providers: [SluStatusService]
		}).compile();

		controller = module.get<SluStatusController>(SluStatusController);
		service = module.get<SluStatusService>(SluStatusService);
		connection = await module.get(getConnectionToken());

		body = {
			id: 'did:iota:1223455',
			status: Status.CREATED,
			channelAddress: '186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:24268d0b046f16be9c169c3e'
		};
		(response as SluStatus) = body;

		devices = [
			{
				id: 'did:iota:2cGnC3bZ66btQA5unbSQuyhKeQ7Z8nzQxGR8F5DKfKgo',
				status: 'created'
			},
			{
				id: 'did:iota:J1TmQdzCGy1VVHBNatSq152cbxy6tP8UVu8GdkD7DoUW',
				status: 'created'
			}
		];

		ids = {
			id: ['did:iota:J1TmQdzCGy1VVHBNatSq152cbxy6tP8UVu8GdkD7DoUW', 'did:iota:2cGnC3bZ66btQA5unbSQuyhKeQ7Z8nzQxGR8F5DKfKgo']
		};
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should create SluStatus', async () => {
		jest.spyOn(service, 'saveSluStatus').mockResolvedValue(response);
		const result = await controller.createSluStatus(body);
		expect(result).toBe(response);
	});

	it('should update SluStatus', async () => {
		const updatedSluStatus = {
			id: 'did:iota:1223455',
			status: Status.INSTALLED,
			channelAddress: '186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:24268d0b046f16be9c169c3e'
		};
		jest.spyOn(service, 'updateSluStatus').mockResolvedValue(updatedSluStatus as SluStatusDocument);
		const result = await controller.updateSluStatus(body.id, Status.INSTALLED);
		expect(result).toBe(updatedSluStatus);
	});

	it('should return SluStatus', async () => {
		jest.spyOn(service, 'getSluStatus').mockResolvedValue(response.status);
		const result = await controller.getStatusInfo(body.id);
		expect(result).toBe(response.status);
	});

	it('should return SluStatuses', async () => {
		jest.spyOn(service, 'getStatuses').mockResolvedValue(devices);
		const result = await controller.getStatuses(ids);
		console.log(result);
		expect(result).toBe(devices);
	});

	afterEach(async () => {
		await connection.close();
		if (mongod) await mongod.stop();
	});
});
