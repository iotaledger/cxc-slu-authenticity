import { Test, TestingModule } from '@nestjs/testing';
import { SluStatusService } from './slu-status.service';
import { SluStatusDto } from './model/slu-status.dto';
import { SluStatus, SluStatusDocument, SluStatusSchema } from './schema/slu-status.schema';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { Status } from './model/Status';

describe('StatusService', () => {
	let service: SluStatusService;
	let body: SluStatusDto;
	let devices: { id: string[] };
	let mongod: MongoMemoryServer;
	let connection: Connection;
	let sluStatusModel: Model<SluStatusDocument>;

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
			providers: [SluStatusService]
		}).compile();

		service = module.get<SluStatusService>(SluStatusService);
		connection = module.get<Connection>(getConnectionToken());
		sluStatusModel = module.get<Model<SluStatusDocument>>(getModelToken(SluStatus.name));

		body = {
			id: 'did:iota:1223455',
			status: Status.CREATED,
			channelAddress: '186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:24268d0b046f16be9c169c3e'
		};

		devices = {
			id: ['did:iota:J1TmQdzCGy1VVHBNatSq152cbxy6tP8UVu8GdkD7DoUW', 'did:iota:2cGnC3bZ66btQA5unbSQuyhKeQ7Z8nzQxGR8F5DKfKgo']
		};
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should save SluStatus', async () => {
		const savedSluStatus = await service.saveSluStatus(body);
		const dbResult = await sluStatusModel.find({ id: body.id });
		expect(dbResult[0].toJSON()).toEqual(savedSluStatus.toJSON());
	});

	it('should throw error because of duplicate key error', async () => {
		await service.saveSluStatus(body);
		const duplicateSave = service.saveSluStatus(body);
		// eslint-disable-next-line prettier/prettier
		const errorMessage = 'E11000 duplicate key error collection: test.slu_status index: id_1 dup key: { id: "did:iota:1223455" }';
		await expect(duplicateSave).rejects.toThrow(errorMessage);
	});

	it('should update slu-status', async () => {
		await service.saveSluStatus(body);
		const update = {
			id: 'did:iota:1223455',
			status: Status.INSTALLED,
			channelAddress: '186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:24268d0b046f16be9c169c3e'
		};
		const result = await service.updateSluStatus(update.id, update.status);
		expect(result.toJSON()).toEqual(update);
	});

	it('should throw DB error: no slu under this id', async () => {
		await service.saveSluStatus(body);
		const update = {
			id: 'id:iota:1223455',
			status: Status.INSTALLED,
			channelAddress: '186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:24268d0b046f16be9c169c3e'
		};
		try {
			await service.updateSluStatus(update.id, update.status);
		} catch (err) {
			expect(err.message).toBe('Could not find document in the collection.');
		}
	});

	it('should return status', async () => {
		const savedSluStatus = await service.saveSluStatus(body);
		const getSavedSluStatus = await service.getSluStatus(body.id);
		expect(getSavedSluStatus).toBe(savedSluStatus.status);
	});

	it('should DB error: no status under this id', async () => {
		try {
			await service.getSluStatus('id:iota:1223456');
		} catch (err) {
			expect(err.message).toBe('Could not find document in the collection.');
		}
	});

	it('should return an array of ids and statuses', async () => {
		const device1 = {
			channelAddress: '2e7c282c139005009b07676a0ad19f3ae504324002429116615723f4b1e990e1000000...',
			status: 'created',
			id: 'did:iota:J1TmQdzCGy1VVHBNatSq152cbxy6tP8UVu8GdkD7DoUW'
		};

		const device2 = {
			channelAddress: '2e7c282c139005009b07676a0ad19f3ae504324002429116615723f4b1e990e1000000...',
			status: 'installed',
			id: 'did:iota:2cGnC3bZ66btQA5unbSQuyhKeQ7Z8nzQxGR8F5DKfKgo'
		};

		await new sluStatusModel(device1).save();
		await new sluStatusModel(device2).save();
		const statuses = await service.getStatuses(devices.id);
		expect(statuses.length).toBe(2);
		expect(statuses[0].status).toBe('installed');
		expect(statuses[1].status).toBe('created');
	});

	it('should throw error for non existing devices', async () => {
		try {
			await service.getStatuses(devices.id);
		} catch (err) {
			expect(err.message).toBe('Could not find document in the collection.');
		}
	});

	afterEach(async () => {
		await connection.close();
		if (mongod) await mongod.stop();
	});
});
