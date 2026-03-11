import { Field, ID, InputType } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

@InputType()
export class ReplaceAllUserRolesInput {
  @Field(() => [String])
  @IsString({ each: true })
  roleIds?: string[];

  @Field(() => ID)
  @Transform(({ value }) => String(value || "").trim())
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
