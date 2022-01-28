import { HttpModule } from '@nestjs/axios';
import { BadRequestException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { Identity, IdentitySchema } from './schemas/identity.schema';

describe('IdentityController', () => {
  let controller: IdentityController;
  let identityService: IdentityService;
  let body;
  let response: Identity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule,
        MongooseModule.forRootAsync({
          useFactory: async () => {
            let mongod = await MongoMemoryServer.create();
            let mongoUri = await mongod.getUri();
            return {
              uri: mongoUri
            }
          }
        }),
        MongooseModule.forFeature([{ name: 'Identity', schema: IdentitySchema }])],
      controllers: [IdentityController],
      providers: [IdentityService]
    }).compile();

    controller = module.get<IdentityController>(IdentityController);
    identityService = module.get<IdentityService>(IdentityService);

    body = {
      did: "did:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd",
      timestamp: "2022-01-27T13:04:18.559Z",
      signature: "2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm"
    }
    response = {
      did: "did:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd",
      timestamp: new Date("2022-01-27T13:04:18.559Z"),
      signature: "2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm"
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a list of auth proves of a device', async () => {
    const result: Identity[] = [{
      did: "did:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd",
      timestamp: new Date("2022-01-27T13:04:18.559Z"),
      signature: "2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm"
    },
    {
      did: "did:iota:3xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd",
      timestamp: new Date("2022-02-27T13:04:18.559Z"),
      signature: "3MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNH"
    }
  ];
    jest.spyOn(identityService, 'getAuthProves').mockResolvedValue(result);
    let did = "did:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd";
    let from = "2022-01-27T13:04:18.559Z";
    let to = "2022-02-27T13:04:18.559Z";
    expect(await controller.getAuthProves({did: did,from: from,to: to})).toBe(result);
  })

  it('should save identity', async () => {
    jest.spyOn(identityService, 'proveAndSaveSlu').mockResolvedValue(response);
    expect(await controller.saveSlu(body)).toBe(response)
  })

  it('should fail to authenticate identity', async () => {
    jest.spyOn(identityService, 'proveAndSaveSlu').mockImplementationOnce(() => {throw new BadRequestException("Could not authenticate device")})
    try{
      await controller.saveSlu(body)
    }catch(ex: any){
      expect(ex.message).toBe("Could not authenticate device")
    }
  })
});
