import { Field, InputType } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class FunctionalityDescriptionInput {
  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  key: string;
}
