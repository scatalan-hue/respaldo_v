import { Field, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { CreateLotInput } from './create-lot.input';

@InputType()
export class UpdateLotInput extends OmitType(PartialType(CreateLotInput), ['name']) {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  id: string;
}
