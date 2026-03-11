import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Max } from 'class-validator';
import { CreateStampInput } from '../../../stamp/dto/input/create-stamp.input';
import { MovementStatus } from '../../enums/movement-status.enum';
import { TypeMovement } from '../../enums/movement-type.enum';
import { Field, ID, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

@InputType()
export class CreateMovementInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @ApiProperty()
  description?: string;

  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  expenditureNumber?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Max(99999999999999.9999)
  @ApiProperty()
  liquidatedValue?: number;


  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Max(99999999999999.9999)
  @ApiProperty()
  paidValue?: number;

  @Field(() => Number, { nullable: true }) // nuevo campo
  @IsOptional()
  @IsNumber()
  @Max(99999999999999.9999)
  @ApiProperty()
  documentValue?: number; // nuevo campo

  @Field(() => Number, { nullable: true }) // nuevo campo
  @IsOptional()
  @IsNumber()
  @Max(99999999999999.9999)
  @ApiProperty()
  percentageValue?: number; // nuevo campo

  @Field(() => Number, { nullable: true }) // nuevo campo
  @IsOptional()
  @IsNumber()
  @Max(99999999999999.9999)
  @ApiProperty()
  taxBasisValue?: number; // nuevo campo

  @Field(() => Number, { nullable: true }) // nuevo campo
  @IsOptional()
  @IsNumber()
  @Max(99999999999999.9999)
  @ApiProperty()
  fixedValue?: number; // nuevo campo

  @Field(() => TypeMovement, { nullable: true })
  @IsOptional()
  @IsEnum(TypeMovement)
  type: TypeMovement;

  @Field(() => Date, { nullable: true })
  @IsNotEmpty()
  @IsDate()
  date?: Date;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Max(99999999999999.9999)
  @ApiProperty()
  value?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  stampId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  organizationProductId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  contractId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  lotId?: string;

  @Field(() => MovementStatus, { nullable: true })
  @IsOptional()
  @IsEnum(MovementStatus)
  status: MovementStatus;

  @Field(() => Boolean, { nullable: true })
  @IsNotEmpty()
  @IsBoolean()
  isRevert?: boolean;

  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  movId?: string;

  @Field(() => CreateStampInput, { nullable: true })
  @IsOptional()
  @IsObject()
  @Type(() => CreateStampInput)
  @ApiProperty({
    type: CreateStampInput,
  })
  stampInput?: CreateStampInput;


  @Field(() => String, { nullable: true })
  @IsString()
  movementRevertId?: string;

  @Field(() => TypeMovement, { nullable: true }) // nuevo campo
  @IsOptional()
  @IsEnum(TypeMovement)
  group?: TypeMovement; // nuevo campo

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @ApiProperty()
  taxpayerId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @ApiProperty()
  transactionId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @ApiProperty()
  documentId?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  associatedMovement?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  typeValue?: string;

  @IsString()
  message?: string


}
