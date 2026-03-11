import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateOrganizationTaxpayerInput } from './create-organization-taxpayer.input';

@InputType()
export class UpdateOrganizationTaxpayerInput extends CreateOrganizationTaxpayerInput {
  @Field(() => ID, { nullable: false })
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
