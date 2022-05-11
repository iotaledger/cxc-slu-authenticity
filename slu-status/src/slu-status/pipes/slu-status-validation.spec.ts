import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { SluStatusDto } from '../model/slu-status.dto';
import { Status } from '../model/Status';
import { SluStatusValidationPipe } from './slu-status-validation.pipe';

describe('transform', () => {
	let sluStatusValidationPipe: SluStatusValidationPipe;
	const metadata: ArgumentMetadata = {
		type: 'body',
		metatype: SluStatusDto,
		data: ''
	};
	let body: SluStatusDto;

	describe('when validation passes', () => {
		beforeEach(() => {
			sluStatusValidationPipe = new SluStatusValidationPipe();
			body = {
				id: 'did:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
				status: Status.CREATED,
				channelAddress: '186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:24268d0b046f16be9c169c3e'
			};
		});

		it('should return the value: no metadata', async () => {
			const validation = await sluStatusValidationPipe.transform(body, {} as any);
			expect(validation).toEqual(body);
		});

		it('should return the value', async () => {
			const sluStatusDto: SluStatusDto = await sluStatusValidationPipe.transform(body, metadata);
			expect(sluStatusDto).toEqual(body);
		});
	});

	describe('when validation fails', () => {
		beforeEach(() => {
			sluStatusValidationPipe = new SluStatusValidationPipe();
		});

		it('should throw error because of false status', async () => {
			const body = {
				id: 'did:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
				status: 'destroyed',
				channelAddress: '186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:24268d0b046f16be9c169c3e'
			};
			const validation = sluStatusValidationPipe.transform(body as SluStatusDto, metadata);
			await expect(validation).rejects.toThrow(BadRequestException);
		});

		it('should throw error because of false DID', async () => {
			const body = {
				id: 'dd:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
				status: 'created',
				channelAddress: '186ae31cffc392c8de858b95e82591368fee453da41653469a35d442c18a4f7e0000000000000000:24268d0b046f16be9c169c3e'
			};
			const validation = sluStatusValidationPipe.transform(body as SluStatusDto, metadata as any);
			await expect(validation).rejects.toThrow(BadRequestException);
		});
	});
});
