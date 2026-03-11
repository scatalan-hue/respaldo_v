import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateAndRemoveRoleFxInput {
  @Field(() => [CreateRoleFxAndUrlsInput])
  @IsArray()
  rolesFx: CreateRoleFxAndUrlsInput[];

  @Field(() => ID)
  @Transform(({ value }) => String(value || "").trim())
  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}

@InputType()
export class CreateRoleFxAndUrlsInput {
  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsString()
  @IsNotEmpty()
  permission: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  urls: string[];
}

@ObjectType()
export class RoleFxAndUrlsResponse {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  permission: string;

  @Field(() => [String], { nullable: true })
  urls: string[];
}
