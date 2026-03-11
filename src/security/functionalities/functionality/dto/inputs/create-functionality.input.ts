import { InputType, Field } from "@nestjs/graphql";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

@InputType()
export class CreateFunctionalityInput {
  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field(() => String)
  @Transform(({ value }) => String(value || "").trim())
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => String(value || "").trim())
  @IsOptional()
  @IsString()
  url?: string;

  @Field(() => String, { nullable: true })
  @Transform(({ value }) => String(value || "").trim())
  @IsOptional()
  @IsString()
  @IsUUID()
  imageId?: string;
}
