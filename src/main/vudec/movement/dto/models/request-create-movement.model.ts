import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, ValidateNested } from 'class-validator';
import { CreateStampInput } from '../../../stamp/dto/input/create-stamp.input';
import { MovementStatus } from '../../enums/movement-status.enum';
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { TypeMovement } from '../../enums/movement-type.enum';
import { Field, ID, InputType } from '@nestjs/graphql';
import { Transform, Type } from 'class-transformer';

@InputType()
@ApiExtraModels()
export class RequestCreateMovement {
  @Field(() => String, { nullable: true })
  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => String(value || "").trim())
  description?: string;

  @Field(() => String, { nullable: true })
  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => String(value || "").trim())
  typeValue?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @ApiProperty()
  @Transform(({ value }) => String(value || "").trim())
  expenditureNumber?: string;

  @Field(() => Number, { nullable: true })
  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Max(99999999999999.9999)
  liquidatedValue?: number;

  @Field(() => Number, { nullable: true })
  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Max(99999999999999.9999)
  documentValue?: number;

  @Field(() => Number, { nullable: true })
  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Max(99999999999999.9999)
  percentageValue?: number;

  @Field(() => Number, { nullable: true })
  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Max(99999999999999.9999)
  taxBasisValue?: number;

  @Field(() => Number, { nullable: true })
  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Max(99999999999999.9999)
  fixedValue?: number;

  @Field(() => Number, { nullable: true })
  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Max(99999999999999.9999)
  paidValue?: number;

  @Field(() => TypeMovement, { nullable: false })
  @ApiProperty({ nullable: true })
  @IsNotEmpty()
  @IsEnum(TypeMovement)
  @Transform(({ value }) => String(value || "").trim())
  type: TypeMovement;

  @Field(() => Date, { nullable: true })
  @ApiProperty({ nullable: true })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @Field(() => Number, { nullable: true })
  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Max(99999999999999.9999)
  value?: number;

  @Field(() => MovementStatus, { nullable: true })
  @IsEnum(MovementStatus)
  @IsOptional()
  @ApiProperty({ nullable: true, enum: MovementStatus })
  @Transform(({ value }) => String(value || "").trim())
  status: MovementStatus;

  @IsOptional()
  @IsUUID()
  contractId?: string;

  @IsOptional()
  @IsUUID()
  lotId?: string;

  @Field(() => Boolean, { nullable: true })
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isRevert?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @ApiProperty()
  @Transform(({ value }) => String(value || "").trim())
  movId?: string;

  @Field(() => TypeMovement, { nullable: true })
  @IsOptional()
  @IsEnum(TypeMovement)
  @ApiProperty()
  group?: TypeMovement;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  @ApiProperty({ nullable: true })
  stampId?: string;

  @Field(() => CreateStampInput, { nullable: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateStampInput)
  @ApiProperty({
    type: CreateStampInput,
    example: {
      name: 'ESTAMPILLA PRO-ADULTO MAYOR',
      stampNumber: '00001',
    },
  })
  stampInput: CreateStampInput;

  @Field(() => ID, { nullable: true })
  @IsNotEmpty()
  @ApiProperty()
  taxpayerId?: string;
  associatedMovement?: string;
  transactionId?: string;
}
