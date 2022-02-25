import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, ValidationError } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SluStatusDto } from '../model/SluStatusDto';
import { Status } from '../model/Status';

@Injectable()
export class SluStatusValidationPipe implements PipeTransform<SluStatusDto> {
	async transform(value: any, { metatype }: ArgumentMetadata) {
		if (!metatype || !this.toValidate(metatype)) {
			return value;
		}
		const object = plainToInstance(metatype, value);
		const errors = await validate(object);
		if (errors.length > 0) {
			throw new BadRequestException(errors);
		}
		if (!Object.values(Status).includes(object.status)) {
			throw new BadRequestException('Validation fails for status: ' + object.status);
		}
		return object;
	}

	private toValidate(metatype: Function): boolean {
		const types: Function[] = [String, Boolean, Number, Array, Object];
		return !types.includes(metatype);
	}
}
