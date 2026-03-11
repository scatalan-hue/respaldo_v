import { IsString } from 'class-validator';
import { CreateProfileInput } from './create-profile.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateProfileInput extends PartialType(CreateProfileInput) {
  @Field(() => ID)
  @IsString()
  id: string;
}
