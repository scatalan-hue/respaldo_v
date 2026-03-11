import { IsString } from "class-validator"

export class ObtainErrorDto {

    @IsString()
    item: string

    @IsString()
    contractNumber: string

    @IsString()
    taxapayer: string

    @IsString()
    typeError: string

    @IsString()
    error: string

    @IsString()
    newContractNumber: string

    @IsString()
    Newtaxapayer: string

}

