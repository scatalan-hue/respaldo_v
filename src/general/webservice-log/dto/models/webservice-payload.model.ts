import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { HttpMethod } from '../../enums/http-method.enum';

@InputType()
export class WebservicePayloadModel {

    @Field(() => String, { nullable: true })
    @IsString()
    @IsOptional()
    @ApiProperty()
    responseOrError?: string;

    @Field(() => Boolean, { nullable: true })
    @IsBoolean()
    @IsOptional()
    @ApiProperty()
    isError?: boolean;

    @Field(() => ConfigWebserviceModel, { nullable: true })
    @IsNotEmpty()
    @ApiProperty()
    config?: ConfigWebserviceModel;
}


@InputType()
export class ConfigWebserviceModel {

    @Field(() => String, { nullable: true })
    @IsString()
    @IsOptional()
    @ApiProperty()
    serviceName?: string;

    @Field(() => String, { nullable: true })
    @IsString()
    @IsOptional()
    @ApiProperty()
    url?: string;

    @Field(() => HttpMethod, { nullable: true })
    @IsEnum(HttpMethod)
    @IsOptional()
    @ApiProperty()
    method?: HttpMethod;
    
    @Field(() => String, { nullable: true })
    @IsString()
    @IsOptional()
    @ApiProperty()
    requestData?: string;
}