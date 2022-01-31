import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { IdentityDto } from '../models/IdentityDto';
import { IdentityService } from '../identity.service';

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

	private toValidate(metatype: Function): boolean {
		const types: Function[] = [String, Boolean, Number, Array, Object];
		return !types.includes(metatype);
	}
}
