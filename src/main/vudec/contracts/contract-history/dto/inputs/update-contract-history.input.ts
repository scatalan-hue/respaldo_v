import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateContractHistoryInput } from './create-contract-history.input';

@InputType()
export class UpdateContractHistoryInput extends CreateContractHistoryInput {
  @Field(() => ID, { nullable: false })
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
