import { Field, ID, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { CreateStampInput } from './create-stamp.input';

@InputType()
export class UpdateStampInput extends PartialType(CreateStampInput) {
  @Field(() => ID)
  @IsString()
  id: string;
}
