import { Test, TestingModule } from '@nestjs/testing';
import { SluNonceController } from './slu-nonce.controller';

describe('SluNonceController', () => {
  let controller: SluNonceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SluNonceController],
    }).compile();

    controller = module.get<SluNonceController>(SluNonceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
