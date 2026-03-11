import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CreateWebserviceLogInput } from './create-webservice-log.input';

@InputType()
export class UpdateWebserviceLogInput extends PartialType(CreateWebserviceLogInput) {
  @Field(() => ID)
  @IsString()
  id: string;
}