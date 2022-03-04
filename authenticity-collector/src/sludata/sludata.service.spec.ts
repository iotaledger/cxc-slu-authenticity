import { Test, TestingModule } from '@nestjs/testing';
import { SludataService } from './sludata.service';

describe('SludataService', () => {
  let service: SludataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SludataService],
    }).compile();

    service = module.get<SludataService>(SludataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
