import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateOrganizationUserInput } from './create-organization-user.input';

@InputType()
export class UpdateOrganizationUserInput extends CreateOrganizationUserInput {
  @Field(() => ID, { nullable: false })
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
