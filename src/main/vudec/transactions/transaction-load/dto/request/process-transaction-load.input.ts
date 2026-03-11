import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ProcessTransactionLoadInput {
  @Field()
  fileId: string;

  @Field({ nullable: true })
  userId?: string;
}
