import { Field, ID, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateOrganizationInput } from './create-organization.input';
import { OrganizationStatus } from '../../enums/organization-status.enum';

@InputType()
export class UpdateOrganizationInput extends OmitType(PartialType(CreateOrganizationInput), ['name']) {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name: string;

  @Field(() => ID, { nullable: false })
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
