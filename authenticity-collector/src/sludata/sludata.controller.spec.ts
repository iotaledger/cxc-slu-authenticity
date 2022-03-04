import { Test, TestingModule } from '@nestjs/testing';
import { SludataController } from './sludata.controller';

describe('SludataController', () => {
  let controller: SludataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SludataController],
    }).compile();

    controller = module.get<SludataController>(SludataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
