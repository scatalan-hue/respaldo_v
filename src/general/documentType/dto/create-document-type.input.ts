import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateDocumentTypeInput {
  @Field(() => String)
  @IsString()
  document: string;
}
