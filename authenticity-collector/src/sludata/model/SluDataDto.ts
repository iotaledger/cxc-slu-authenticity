import { Contains, IsNotEmpty, IsString } from "class-validator"

export class SluDataDto{
    @IsNotEmpty()
    @IsString()
    hashedData: string

    @IsNotEmpty()
    @IsString()
    @Contains('did:iota:')
    deviceId: string
}