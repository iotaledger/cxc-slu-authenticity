import { Test, TestingModule } from '@nestjs/testing';
import { CreatorDevicesController } from './creator-devices.controller';

describe('CreatorDevicesController', () => {
  let controller: CreatorDevicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreatorDevicesController],
    }).compile();

    controller = module.get<CreatorDevicesController>(CreatorDevicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
