import { Field, ID, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { CreateFileBySourceInput } from '../../../../../../general/files/dto/inputs/create-file-by-source.input';
import { CreateProductInput } from '../../../../product/dto/inputs/create-products.input';
import { OrdenType } from '../../enums/organization-orden.enum';
import { calculateDigitVerification } from '../../../../../../common/functions';

@InputType()
export class CreateOrganizationExternalInput {
  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @Field(() => String, { nullable: false })
  @Transform(({ value }) => {
    const digitsOnly = value.replace(/\D/g, '');

    if (digitsOnly.length < 2) {
      return digitsOnly;
    }

    const body = digitsOnly.slice(0, -1);
    const lastDigit = digitsOnly.slice(-1);

    const calculatedDV = calculateDigitVerification(body);

    if (calculatedDV.toString() === lastDigit) {
      return body;
    } else {
      return digitsOnly;
    }
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  nit: string;

  @Field(() => OrdenType, { nullable: false })
  @IsEnum(OrdenType)
  @IsNotEmpty()
  @ApiProperty({ enum: OrdenType, nullable: false })
  ordenType: OrdenType;

  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(({ value }) => (String(value || "").trim() || "")?.toLowerCase())
  email: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @ApiProperty()
  departmentCode?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @ApiProperty()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @ApiProperty()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @ApiProperty()
  schedule?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @ApiProperty()
  cityCode?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @ApiProperty()
  phone?: string;

  @Field(() => CreateFileBySourceInput, { nullable: true })
  @IsOptional()
  @ApiProperty()
  logoInput?: CreateFileBySourceInput;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  organizationParentId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @ApiProperty()
  organizationParentNit?: string;

  @ApiProperty({
    type: [CreateProductInput],
    isArray: true,
    example: [
      {
        name: 'string',
        description: 'string',
      },
    ],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProductInput)
  products: CreateProductInput[];
}
