import { Field, ID, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class ReponsePendingDocModel {

    @Field(() => String, { nullable: true })
    @IsString()
    @IsOptional()
    @ApiProperty()
    request: string;

    @Field(() => String, { nullable: true })
    @IsString()
    @IsOptional()
    @ApiProperty()
    response: string;

    @Field(() => String, { nullable: false })
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    guid: string;
}