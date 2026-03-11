import { InputType, Field, PartialType, ID } from "@nestjs/graphql";
import { CreateFunctionalityInput } from "./create-functionality.input";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";
import { Transform } from "class-transformer";

@InputType()
export class UpdateFunctionalityInput extends PartialType(CreateFunctionalityInput) {
  @Field(() => ID)
  @Transform(({ value }) => String(value || "").trim())
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
