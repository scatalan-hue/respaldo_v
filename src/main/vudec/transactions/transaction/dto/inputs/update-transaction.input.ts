import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateTransactionInput } from './create-transaction.input';
import { ValidationResponse } from '../../enum/validation-response.enum';

@InputType()
export class UpdateTransactionInput extends PartialType(CreateTransactionInput) {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field(() => ValidationResponse, { nullable: true })
  @IsEnum(ValidationResponse)
  @IsOptional()
  validation?: ValidationResponse;

  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  contractId?: string;
}
