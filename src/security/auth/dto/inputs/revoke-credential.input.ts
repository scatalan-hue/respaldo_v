import { InputType, Field } from '@nestjs/graphql';
import { ArrayNotEmpty, IsArray, IsDate, IsOptional, IsString } from 'class-validator';

@InputType()
export class RevokeCredentialInput {
  @Field(() => [String])
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  userIds: string[];

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  credentialsExpirationDate?: Date;
}
