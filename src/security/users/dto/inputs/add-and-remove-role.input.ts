import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { Transform } from '@nestjs/class-transformer';

@InputType()
export class AddAndRemoveRoleInput {
  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsUUID()
  roleId: string;
}
