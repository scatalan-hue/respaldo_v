import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CreateTransactionHistoryInput } from './create-transaction-history.input';

@InputType()
export class UpdateTransactionHistoryInput extends PartialType(CreateTransactionHistoryInput) {
  @Field(() => ID)
  @IsString()
  id: string;
}
