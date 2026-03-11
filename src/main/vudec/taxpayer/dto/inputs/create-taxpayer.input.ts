import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TypeDoc } from '../../enums/taxpayer-type.enum';

@InputType()
export class CreateTaxpayerInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => String(value || "").trim())
  fullName?: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @ApiProperty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty()
  middleName?: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @ApiProperty()
  lastName: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty()
  secondSurname?: string;

  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return "";
    if (typeof value === 'number') return value.toString().trim().toLowerCase();
    if (typeof value === 'string') return String(value || "").trim().toLowerCase();
    return String(value).trim().toLowerCase();
  })
  taxpayerNumber: string;

  @Field(() => TypeDoc, { nullable: true })
  @IsOptional()
  @ApiProperty()
  @IsEnum(TypeDoc)
  @Transform(({ value }) => String(value || "").trim())
  taxpayerNumberType?: TypeDoc;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @Transform(({ value }) => (String(value || "").trim() || "")?.toLowerCase())
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @ApiProperty({ maxLength: 18 })
  @IsString()
  @Transform(({ value }) => String(value || "").trim())
  phone?: string;
}
