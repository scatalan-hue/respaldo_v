import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max } from 'class-validator';
import { TransactionAction } from '../../../transaction/enum/transaction-action.enum';

@InputType()
export class CreateTransactionHistoryInput {

  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  data: string;

  @Field(() => TransactionAction, { nullable: false })
  @IsEnum(TransactionAction)
  @IsNotEmpty()
  action: TransactionAction;

  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

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

  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  taxpayerId: string;

  isRevert?: boolean;
}
