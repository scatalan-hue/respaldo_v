import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateOrganizationProductInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => ID, { nullable: false })
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @Field(() => ID, { nullable: false })
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @Field(() => String, { nullable: false })
  @IsString()
  @IsOptional()
  url?: string;
}
