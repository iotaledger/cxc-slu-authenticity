import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { IdentityDto } from '../models/IdentityDto';
import { IdentityValidationPipe } from './identity-validation.pipe';

describe('transform', () => {
	let identityValidation: IdentityValidationPipe;
	const metadata: ArgumentMetadata = {
		type: 'body',
		metatype: IdentityDto,
		data: ''
	};

	describe('when validation passes', () => {
		beforeEach(() => {
			identityValidation = new IdentityValidationPipe();
		});

		it('should return the value: no metadata', async () => {
			let body = {
				did: 'did:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
				timestamp: '2022-01-27T10:14:14Z',
				signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
			};
			expect(await identityValidation.transform(body, {} as any)).toBe(body);
		});

		it('should return the value', async () => {
			let body = {
				did: 'did:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
				timestamp: '2022-01-27T10:14:14Z',
				signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
			};
			const bodyDto = {...body, timestamp: new Date(body.timestamp)}
			expect(await identityValidation.transform(body, metadata)).toEqual(bodyDto);
		});
	});

	describe('when validation fails', () => {
		beforeEach(() => {
			identityValidation = new IdentityValidationPipe();
		});

		it('should throw error because of false timestamp', async () => {
			let body = {
				did: 'did:iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
				timestamp: '20211127T08:47:33Z',
				signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
			};
			await expect(identityValidation.transform(body, metadata)).rejects.toThrow(BadRequestException);
		});

		it('should throw error because of false DID', async () => {
			let body = {
				did: 'iota:2xCZnoUYakpLYzSWXjwiebYp6RpiUi8DvD9DwoU3qe335sdd',
				timestamp: '2022-01-27T10:14:14Z',
				signature: '2MrtMZZYmKUrB2jdsG4hwzD6yxAjo3uUrnNq44uVFWd6p8zvaRqhwvfQV5keGdJXV57HS7V9djWM5ZSm8dwY7FNm'
			};
			await expect(identityValidation.transform(body, metadata as any)).rejects.toThrow(BadRequestException);
		});
	});
});
