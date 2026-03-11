import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { CreateUserInput } from './create-user.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field(() => ID)
  @IsString()
  @IsUUID()
  id: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  confirmationCode?: string;

  loginAttempts?: number;

  attemptsCycles?: number;

  lastFailedAttemptDate?: Date;
}
