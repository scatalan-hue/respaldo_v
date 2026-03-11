import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateLotContractInput } from './create-lot-contract.input';

@InputType()
export class UpdateLotContractInput extends CreateLotContractInput {
  @Field(() => ID, { nullable: false })
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
