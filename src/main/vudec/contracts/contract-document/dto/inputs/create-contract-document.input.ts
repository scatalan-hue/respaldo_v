import { Field, ID, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max } from 'class-validator';

@InputType()
export class CreateContractDocumentInput {
  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  @Transform(({ value }) => String(value || "").trim())
  description: string;

  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  @Transform(({ value }) => String(value || "").trim())
  document: string;

  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  @Transform(({ value }) => String(value || "").trim())
  typeDocument: string;

  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  @Transform(({ value }) => String(value || "").trim())
  url: string;

  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  @Transform(({ value }) => String(value || "").trim())
  contractId: string;

  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  @Transform(({ value }) => String(value || "").trim())
  transactionId: string;
}
