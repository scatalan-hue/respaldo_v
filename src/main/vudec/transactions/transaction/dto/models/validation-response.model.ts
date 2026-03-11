import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TransactionStatus } from '../../enum/transaction-status.enum';
import { ValidationResponse } from '../../enum/validation-response.enum';

@ObjectType()
export class ValidationResponseModel {

    @Field(() => ValidationResponse, { nullable: false })
    @IsEnum(ValidationResponse)
    @IsNotEmpty()
    @ApiProperty()
    status: ValidationResponse;

    @Field(() => String, { nullable: true })
    @IsString()
    @IsOptional()
    @ApiProperty()
    message?: string;
}