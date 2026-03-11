import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';
import { CreateServerInput } from './create-server.input';

@InputType()
export class UpdateServerInput extends PartialType(CreateServerInput) {
  @Field(() => ID)
  @IsString()
  @IsUUID()
  id: string;
}
