import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateOrganizationProductInput } from './create-organization-product.input';

@InputType()
export class UpdateOrganizationProductInput extends CreateOrganizationProductInput {
  @Field(() => ID, { nullable: false })
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
