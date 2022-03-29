import { Test, TestingModule } from '@nestjs/testing';
import { SluNonceService } from './slu-nonce.service';

describe('SluNonceService', () => {
  let service: SluNonceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SluNonceService],
    }).compile();

    service = module.get<SluNonceService>(SluNonceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
