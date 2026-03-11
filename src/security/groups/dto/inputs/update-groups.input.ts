import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CreateGroupInput } from './create-groups.input';

@InputType()
export class UpdateGroupInput extends PartialType(CreateGroupInput) {
  @Field(() => ID)
  @IsString()
  id: string;
}
