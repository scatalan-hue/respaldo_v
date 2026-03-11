import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { WebserviceLogStatus } from '../../enums/webservice-log-status.enum';
import { HttpMethod } from '../../enums/http-method.enum';

@InputType()
export class CreateWebserviceLogInput {

  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  serviceName: string;

  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  endpoint: string;

  @Field(() => HttpMethod, { nullable: false })
  @IsEnum(HttpMethod)
  @IsNotEmpty()
  @ApiProperty()
  httpMethod: HttpMethod;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  request?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  response?: string;

  @Field(() => WebserviceLogStatus, { nullable: true })
  @IsEnum(WebserviceLogStatus)
  @IsOptional()
  @ApiProperty({ required: false })
  status?: WebserviceLogStatus;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @ApiProperty({ required: false })
  statusCode?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  errorMessage?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  userId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  transactionId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  movementId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: false })
  organizationProductId: string;
}