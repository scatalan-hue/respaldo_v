import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from '@nestjs/class-transformer';
import { CustomPasswordScalar } from '../../scalars/password.scalar';

@InputType()
export class UpdateUserPasswordInput {
  @Field(() => CustomPasswordScalar)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @Field(() => CustomPasswordScalar)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  newPassword: string;

  @Field(() => CustomPasswordScalar)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  newPasswordConfirm: string;
}
