import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateSecUserTokenInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  token?: string;

  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  signatureId?: string;

  @Field(() => ID, { nullable: true })
  @IsString()
  @IsOptional()
  userId?: string;
}
