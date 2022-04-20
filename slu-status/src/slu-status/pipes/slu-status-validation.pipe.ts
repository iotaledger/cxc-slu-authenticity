import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SluStatusDto } from '../model/SluStatusDto';
import { Status } from '../model/Status';

@Injectable()
export class SluStatusValidationPipe implements PipeTransform<SluStatusDto> {
	async transform(value: SluStatusDto, { metatype }: ArgumentMetadata) {
		const object = plainToInstance(metatype, value);
		const errors = await validate(object);
		if (errors.length > 0) {
			throw new BadRequestException(errors);
		}
		if (!object.id.includes('did:iota')) {
			throw new BadRequestException('Validation fails for status: ' + object.id);
		}
		if (!Object.values(Status).includes(object.status)) {
			throw new BadRequestException('Validation fails for status: ' + object.status);
		}
		return object;
	}
}
