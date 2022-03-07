import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { SludataController } from './sludata.controller';
import { SludataService } from './sludata.service';

describe('SludataController', () => {
	let controller: SludataController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports:[HttpModule, ConfigModule],
			controllers: [SludataController],
			providers: [SludataService]
		}).compile();

		controller = module.get<SludataController>(SludataController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
