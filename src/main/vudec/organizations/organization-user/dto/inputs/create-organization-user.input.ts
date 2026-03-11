import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateOrganizationUserInput {
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
  userId: string;
}
