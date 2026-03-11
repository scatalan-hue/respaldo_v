import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CreateProductInput } from './create-products.input';

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
  @Field(() => ID)
  @IsString()
  id: string;
}
