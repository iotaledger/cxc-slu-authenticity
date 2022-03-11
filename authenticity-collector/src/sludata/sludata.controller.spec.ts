import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { SluDataDto } from './model/SluDataDto';
import { SludataController } from './sludata.controller';
import { SludataService } from './sludata.service';

describe('SludataController', () => {
	let controller: SludataController;
	let sluDataBody: SluDataDto;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [HttpModule, ConfigModule],
			controllers: [SludataController],
			providers: [SludataService]
		}).compile();

		controller = module.get<SludataController>(SludataController);

		sluDataBody = {
			payload: { temperature: '60 degress' },
			deviceId: 'did:iota:12345'
		};
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should return ChannelData', async () => {
		const response = {
			link: '100a9101d361a1e3657681182a5f2784bb4e02c332fdc426ac4dc5b67d9eced10000000000000000:9d7eb01c80434db6ccde4a18',
			messageId: '455e4e325a34e2406d153a9a6587526f6f651d4c03af2b0ab0364a763e6831f9',
			log: {
				created: '2022-03-09T14:21:55Z',
				payload: {
					hashedData: 'U2FsdGVkX199lBknVEUkXZvpyPu+Gcz1hiEVjtNAywwC12yvuY+Vbca50pVhbfA4',
					deviceId: 'did:iota:122'
				}
			}
		};
		const serviceSpy = jest.spyOn(SludataService.prototype, 'writeData').mockResolvedValue(response);
		const result = await controller.writeData(sluDataBody);
		expect(serviceSpy).toBeCalled();
		expect(result).toBe(response);
	});
});
