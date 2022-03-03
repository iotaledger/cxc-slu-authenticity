import { Test, TestingModule } from '@nestjs/testing';
import { ChannelSubscriptionService } from './channel-subscription.service';
import { ChannelInfo, CreateChannelResponse, ChannelClient } from 'iota-is-sdk';
import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

describe('ChannelSubscriptionService', () => {
  let service: ChannelSubscriptionService;
  let channelInfo: ChannelInfo;
  let logger: Logger

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [ChannelSubscriptionService, Logger],
    }).compile();
    channelInfo = {
      channelAddress: '100a9101d361a1e3657681182a5f2784bb4e02c332fdc426ac4dc5b67d9eced10000000000000000:c2fe471fd08bc988b9cb2de8',
      authorId: 'did:iota:12345',
      topics: [
        {
          type: 'slu-data',
          source: 'slu'
        }
      ]
    };
    service = module.get<ChannelSubscriptionService>(ChannelSubscriptionService);
    logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create channel', async () => {
    const createChannelResponse: CreateChannelResponse = {
      channelAddress: '100a9101d361a1e3657681182a5f2784bb4e02c332fdc426ac4dc5b67d9eced10000000000000000:c2fe471fd08bc988b9cb2de8'
    };
    const channelClientSpy = jest.spyOn(ChannelClient.prototype, 'authenticate').mockResolvedValueOnce();
    const searchSpy = jest.spyOn(ChannelClient.prototype, 'search').mockResolvedValueOnce([]);
    const createSpy = jest.spyOn(ChannelClient.prototype, 'create').mockImplementationOnce(() => Promise.resolve(createChannelResponse));
    const loggerSpy = jest.spyOn(Logger,'log');
    await service.channelSubscription();

    expect(channelClientSpy).toBeCalled();
    expect(searchSpy).toBeCalled();
    expect(createSpy).toBeCalled();
    //expect(loggerSpy).not.toBeCalled();
  });

  it('should log existing channel', async () => {
    const channelClientSpy = jest.spyOn(ChannelClient.prototype, 'authenticate').mockResolvedValueOnce();
    const searchSpy = jest.spyOn(ChannelClient.prototype, 'search').mockResolvedValueOnce([channelInfo]);
    const loggerSpy = jest.spyOn(Logger,'log');
    await service.channelSubscription();

    expect(channelClientSpy).toBeCalled();
    expect(searchSpy).toBeCalled();
    //expect(loggerSpy).toBeCalled();
  });

  it('should throw error', async () => {
    process.env.COLLECTOR_ID_PATH = '';

    const error =  service.channelSubscription();

    await expect(error).rejects.toThrowError();
   
  });
});

