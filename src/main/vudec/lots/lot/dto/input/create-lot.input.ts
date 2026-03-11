import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateLotInput {
  @Field(() => String)
  @IsString()
  name: string;
}
