import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max } from 'class-validator';
import { TransactionStatus } from '../../enum/transaction-status.enum';
import { TransactionAction } from '../../enum/transaction-action.enum';

@InputType()
export class CreateTransactionInput {
  
  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  key: string;

  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  documentPrincipal: string;

  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  data: string;

  @Field(() => TransactionStatus, { nullable: true })
  @IsEnum(TransactionStatus)
  @IsOptional()
  @ApiProperty()
  status?: TransactionStatus;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty()
  message?: string;

  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  taxpayerId: string;

  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  organizationProductId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string;

  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  contractNumber?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Max(99999999999999.9999)
  @ApiProperty()
  contractValue?: number;

  @Field(() => TransactionAction, { nullable: true })
  @IsOptional()
  @IsEnum(TransactionAction)
  @ApiProperty()
  action?: TransactionAction;
}
