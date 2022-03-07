import { HttpModule } from '@nestjs/axios';
import { ConfigModule} from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { SludataService } from './sludata.service';

describe('SludataService', () => {
	let service: SludataService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [ConfigModule, HttpModule],
			providers: [SludataService]
		}).compile();

		service = module.get<SludataService>(SludataService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});
