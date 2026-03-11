import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { CreateDocumentTypeInput } from './create-document-type.input';
import { IsString, IsUUID } from 'class-validator';

@InputType()
export class UpdateDocumentTypeInput extends PartialType(CreateDocumentTypeInput) {
  @Field(() => ID)
  @IsString()
  @IsUUID()
  id: string;
}
