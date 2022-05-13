import { getConnectionToken, getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CreatorDevicesService } from './creator-devices.service';
import { CreatorDevice, CreatorDeviceDocument, CreatorDeviceSchema } from './schema/creator-devices.schema';
import { Connection, Model } from 'mongoose';

describe('CreatorDevicesService', () => {
  let service: CreatorDevicesService;
  let mongod: MongoMemoryServer;
  let connection: Connection;
  let creatorDevicesModel: Model<CreatorDeviceDocument>;
  let creatorDevice: CreatorDevice;

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
      providers: [CreatorDevicesService],
    }).compile();

    service = module.get<CreatorDevicesService>(CreatorDevicesService);
    connection = module.get<Connection>(getConnectionToken());
    creatorDevicesModel = module.get<Model<CreatorDeviceDocument>>(getModelToken(CreatorDevice.name));
 
    creatorDevice = {
      id: 'did:iota:12345',
      channelAddress: 'nn32j02h3onfr203',
      creator: 'did:iota:54321',
      name: 'test-name',
      channelName: 'channel-test-name'
    };

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save creator-device', async () => {
  
    const resp = await service.saveCreatorDevice(creatorDevice) as any;
    delete resp._id;

    expect(resp).toEqual(creatorDevice);
  })

  it('should get the creator-devices', async () => {
    const device = (await new creatorDevicesModel(creatorDevice).save()).toObject();

    const resp = await service.getAllDevices('did:iota:54321');

    expect(resp).toEqual([device]);
  })

  it('should only return the devices of the creator', async () => {
    const creatorDevice2 = {
      id: 'did:iota:123456',
      channelAddress: 'nn32j02h3onfr203',
      creator: 'did:iota:54321',
      name: 'test-name-2',
      channelName: 'channel-test-name-2'
    };
    const creatorDevice3 = {
      id: 'did:iota:123457',
      channelAddress: 'nn32j02h3onfr203',
      creator: 'did:iota:54322',
      name: 'test-name-3',
      channelName: 'channel-test-name-3'
    };
    const device1 = (await new creatorDevicesModel(creatorDevice).save()).toObject();
    const device2 = (await new creatorDevicesModel(creatorDevice2).save()).toObject();
    const device3 = (await new creatorDevicesModel(creatorDevice3).save()).toObject();

    const resp = await service.getAllDevices( 'did:iota:54321');

    expect(resp).toEqual([device1, device2]);

  })

  afterEach(async () => {
		await connection.close();
		if (mongod) await mongod.stop();
	});
});
