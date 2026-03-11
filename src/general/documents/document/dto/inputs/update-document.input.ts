import { IsBoolean, IsDate, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateDocumentInput } from './create-document.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateDocumentInput extends PartialType(CreateDocumentInput) {
  @Field(() => ID)
  @IsString()
  @IsUUID()
  id: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  hasCanceled?: boolean;
}
