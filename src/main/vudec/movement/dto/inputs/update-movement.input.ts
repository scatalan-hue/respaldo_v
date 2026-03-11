import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { CreateMovementInput } from './create-movement.input';

@InputType()
export class UpdateMovementInput extends PartialType(CreateMovementInput) {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  id: string;
}
