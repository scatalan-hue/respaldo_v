import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { CreateTemplateInput } from './create-template.input';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdateTemplateInput extends PartialType(CreateTemplateInput) {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;
}
