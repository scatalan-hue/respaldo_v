import { Field, ID, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max } from 'class-validator';

@InputType()
export class CreateContractHistoryInput {
  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  @Transform(({ value }) => String(value || "").trim())
  consecutive?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @ApiProperty()
  @Transform(({ value }) => String(value || "").trim())
  lotConsecutive?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @ApiProperty()
  @Transform(({ value }) => String(value || "").trim())
  contractType?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => String(value || "").trim())
  @ApiProperty()
  lotId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @ApiProperty()
  guid?: string;

  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  @Transform(({ value }) => String(value || "").trim())
  internalId?: string;

  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  @Transform(({ value }) => String(value || "").trim())
  contractName?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Max(99999999999999.9999)
  @ApiProperty()
  contractValue?: number;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiProperty()
  contractDate?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiProperty()
  contractDateIni?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiProperty()
  contractDateEnd?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @ApiProperty()
  urlDocument?: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  @Transform(({ value }) => String(value || "").trim())
  @ApiProperty()
  organizationProductId: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  @Transform(({ value }) => String(value || "").trim())
  @ApiProperty()
  taxpayerId: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  @Transform(({ value }) => String(value || "").trim())
  @ApiProperty()
  contractId: string;
}
