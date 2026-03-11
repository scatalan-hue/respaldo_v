import { Field, ID, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID, Max, ValidateNested } from 'class-validator';
import { RequestCreateMovement } from 'src/main/vudec/movement/dto/models/request-create-movement.model';
import { CreateTaxpayerInput } from 'src/main/vudec/taxpayer/dto/inputs/create-taxpayer.input';
import { CreateContractDocumentInput } from '../../../contract-document/dto/inputs/create-contract-document.input';

@InputType()
export class CreateContractInput {
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
  documentPrincipal: string;

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
  
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @ApiProperty()
  baseGuid?: string;

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

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  isRevert?: Boolean;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  taxpayerId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  organizationProductId?: string;

  @Field(() => [CreateContractDocumentInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ApiProperty({
    type: [CreateContractDocumentInput],
    example: [
      {
        description: 'Descripción del documento',
        document: 'Contenido del documento',
        documentType: 'EGRESO',
        url: 'https://example.com/egreso.pdf',
      },
    ],
  })
  documents?: CreateContractDocumentInput[];

  @Field(() => CreateTaxpayerInput, { nullable: false })
  @IsNotEmpty()
  @IsObject()
  @Type(() => CreateTaxpayerInput)
  @ApiProperty({
    type: CreateTaxpayerInput,
    example: {
      name: 'Nicolas g',
      taxpayerNumber: 22533750,
      taxpayerNumberType: 'CC',
      email: 'nicg@gmail.com',
      phone: '311754392',
    },
  })
  taxpayerInput: CreateTaxpayerInput;

  @Field(() => CreateTaxpayerInput, { nullable: false })
  @IsNotEmpty()
  @IsObject()
  @Type(() => CreateTaxpayerInput)
  @ApiProperty({
    type: CreateTaxpayerInput,
    example: {
      name: 'Nicolas g',
      taxpayerNumber: 22533750,
      taxpayerNumberType: 'CC',
      email: 'nicg@gmail.com',
      phone: '311754392',
    },
  })
  decentralizedInput: CreateTaxpayerInput;

  @Field(() => [RequestCreateMovement], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => RequestCreateMovement)
  @ApiProperty({
    type: [RequestCreateMovement],
    isArray: true,
    example: [
      {
        description: 'Descripción',
        liquidatedValue: 300000,
        paidValue: 100000,
        type: 'REGISTER',
        isRevert: false,
        expenditureNumber: '2014.CEN.01.008704',
        date: new Date('2024-12-21T08:45:27.333Z'),
        value: 750000,
        stampInput: {
          name: 'ESTAMPILLA PRO-ADULTO MAYOR',
          stampNumber: '00001',
        },
      },
    ] as RequestCreateMovement[],
  })
  movementsInput: RequestCreateMovement[];
}
