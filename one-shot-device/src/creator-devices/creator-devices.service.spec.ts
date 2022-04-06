import { Test, TestingModule } from '@nestjs/testing';
import { CreatorDevicesService } from './creator-devices.service';

describe('CreatorDevicesService', () => {
  let service: CreatorDevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreatorDevicesService],
    }).compile();

    service = module.get<CreatorDevicesService>(CreatorDevicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
