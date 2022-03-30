import { Test, TestingModule } from '@nestjs/testing';
import { SluNonceDto } from './model/slu-nonce.dto';
import { SluNonce, SluNonceSchema } from './schema/slu-nonce.schema';
import { SluNonceController } from './slu-nonce.controller';
import { SluNonceService } from './slu-nonce.service';
import { DeleteResult } from 'mongodb';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';

describe('SluNonceController', () => {
	let controller: SluNonceController;
	let service: SluNonceService;
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
				MongooseModule.forFeature([{ name: SluNonce.name, schema: SluNonceSchema }])
			],
			controllers: [SluNonceController],
			providers: [SluNonceService]
		}).compile();

		controller = module.get<SluNonceController>(SluNonceController);
		service = module.get<SluNonceService>(SluNonceService);
		connection = module.get<Connection>(getConnectionToken());
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('/slu-nonce - POST', async () => {
		const sluNonce: SluNonceDto = { sluId: 'did:iota:12345', nonce: '12nnc2jfn2hf20hnf20932', creator: 'did:iota:54321' };
		const serviceSpy = jest.spyOn(service, 'saveSluNonce').mockResolvedValue(sluNonce);

		const response = await controller.saveSluNonce(sluNonce);

		expect(response).toBe(sluNonce);
		expect(serviceSpy).toHaveBeenCalledWith(sluNonce);
	});

	it('/slu-nonce/:id/:creator - GET', async () => {
		const sluNonce: SluNonce = { sluId: 'did:iota:12345', nonce: '12nnc2jfn2hf20hnf20932', creator: 'did:iota:54321' };
		const creator = 'did:iota:54321';
		const sluId = 'did:iota:12345';
		const serviceSpy = jest.spyOn(service, 'getSluNonce').mockResolvedValue(sluNonce);

		const response = await controller.getSluNonce(sluId, creator);

		expect(response).toBe(sluNonce);
		expect(serviceSpy).toHaveBeenCalledWith(sluId, creator);
	});

	it('/slu-nonce/:id/:creator - DELETE', async () => {
		const deleteResult: DeleteResult = { acknowledged: true, deletedCount: 1 };
		const creator = 'did:iota:54321';
		const sluId = 'did:iota:12345';
		const serviceSpy = jest.spyOn(service, 'deleteSluNonce').mockResolvedValue(deleteResult);

		const response = await controller.deleteSluNonce(sluId, creator);

		expect(response).toBe(deleteResult);
		expect(serviceSpy).toHaveBeenCalledWith(sluId, creator);
	});

	it('/slu-nonces/:creator - POST', async () => {
		const sluIds = { sluIds: ['did:iota:123', 'did:iota:1234'] };
		const result: SluNonce[] = [
			{
				creator: "'did:iota:54321'",
				nonce: '15a3e28c-8800-4132-9042-76e24f3dce54',
				sluId: 'did:iota:123'
			},
			{
				creator: "'did:iota:54321'",
				nonce: 'bfef4e58-645f-4149-8abd-a6ab18867537',
				sluId: 'did:iota:1234'
			}
		];
		const creator = 'did:iota:54321';
		const serviceSpy = jest.spyOn(service, 'getSluNonces').mockResolvedValue(result);

		const response = await controller.getSluNonces(sluIds, creator);

		expect(response).toBe(result);
		expect(serviceSpy).toHaveBeenCalledWith(sluIds.sluIds, creator);
	});

	afterEach(async () => {
		await connection.close();
		if (mongod) await mongod.stop();
	});
});
