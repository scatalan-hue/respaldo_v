import { IsString, IsUUID } from 'class-validator';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreateUserKeyInput } from './create-user-key.input';

@InputType()
export class UpdateUserKeyInput extends PartialType(CreateUserKeyInput) {
  @Field(() => ID)
  @IsString()
  @IsUUID()
  id: string;
}
