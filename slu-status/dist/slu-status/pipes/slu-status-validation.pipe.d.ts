import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { SluStatusDto } from '../model/SluStatusDto';
export declare class SluStatusValidationPipe implements PipeTransform<SluStatusDto> {
    transform(value: any, { metatype }: ArgumentMetadata): Promise<any>;
    private toValidate;
}
