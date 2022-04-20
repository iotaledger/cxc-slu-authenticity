import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CreatorDevicesController } from './creator-devices.controller';
import { CreatorDevicesService } from './creator-devices.service';
import { CreatorDevice, CreatorDeviceSchema } from './schema/creator-devices.schema';
import { Connection } from 'mongoose';

describe('CreatorDevicesController', () => {
  let controller: CreatorDevicesController;
  let mongod: MongoMemoryServer;
  let connection: Connection;
  let creatorDevicesService;

  beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          MongooseModule.forRootAsync({
            useFactory: async () => {
              mongod = await MongoMemoryServer.create();
              const mongouri = await mongod.getUri();
              return {
                uri: mongouri
              }
            }
          }),
          MongooseModule.forFeature([{ name: CreatorDevice.name, schema: CreatorDeviceSchema }])],
        controllers: [CreatorDevicesController],
        providers: [CreatorDevicesService]
      }).compile();

      controller = module.get<CreatorDevicesController>(CreatorDevicesController);
      connection = module.get<Connection>(getConnectionToken());
      creatorDevicesService = module.get<CreatorDevicesService>(CreatorDevicesService);
    });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return list of creator-devices', async () => {
    const creatorDevices: CreatorDevice[] = [ {
      id: 'did:iota:12345',
      channelAddress: 'nn32j02h3onfr203',
      creator: 'did:iota:54321'
    }];

    const creatorDevicesServiceSpy = jest.spyOn(creatorDevicesService, 'getAllDevices').mockResolvedValue(creatorDevices);

    await controller.getCreatorDevices('did:iota:54321');

    expect(creatorDevicesServiceSpy).toBeCalled();
  })

  afterEach(async () => {
		await connection.close();
		if (mongod) await mongod.stop();
	});
});
