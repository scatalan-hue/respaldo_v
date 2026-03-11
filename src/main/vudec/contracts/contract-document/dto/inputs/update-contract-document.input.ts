import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateContractDocumentInput } from './create-contract-document.input';

@InputType()
export class UpdateContractDocumentInput extends CreateContractDocumentInput {
  @Field(() => ID, { nullable: false })
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
