import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { IdentityDto } from '../models/IdentityDto';

@Injectable()
export class IdentityValidationPipe implements PipeTransform<IdentityDto> {
	async transform(value: any, { metatype }: ArgumentMetadata) {
		if (!metatype || !this.toValidate(metatype)) {
			return value;
		}
		const v = { ...value, timestamp: new Date(value.timestamp) };
		const object = plainToInstance(metatype, v);
		const errors = await validate(object);
		if (errors.length > 0) {
			throw new BadRequestException('Validation failed');
		}
		return object;
	}

	private toValidate(metatype): boolean {
		const types = [String, Boolean, Number, Array];
		return !types.includes(metatype);
	}
}
