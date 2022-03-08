import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { SludataController } from './sludata.controller';
import { SludataService } from './sludata.service';

describe('SludataController', () => {
	let controller: SludataController;
	let sluDataBody;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [HttpModule, ConfigModule],
			controllers: [SludataController],
			providers: [SludataService]
		}).compile();

		controller = module.get<SludataController>(SludataController);

		sluDataBody = {
			hashedData: "121392infiob9w7f2oinf",
			deviceId: "did:iota:12345"
		}

	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should return ChannelData', async () => {
		const response = {
			link: "someString",
			log: {
				payload: {
					hashedData: "121392infiob9w7f2oinf",
					deviceId: "did:iota:12345"
				}
			}
		}
		const serviceSpy = jest.spyOn(SludataService.prototype, 'writeData').mockResolvedValue(response);
		const result = await controller.writeData(sluDataBody);
		expect(serviceSpy).toBeCalled();
		expect(result).toBe(response);
	});
});
