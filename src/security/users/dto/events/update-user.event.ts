import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";
import { GraphQLJSONObject } from "graphql-type-json";
import { IContext } from "../../../../patterns/crud-pattern/interfaces/context.interface";
import { UpdateUserInput } from "../inputs/update-user.input";

@InputType()
export class UpdateUserEventInput {
  @Field(() => GraphQLJSONObject)
  @IsNotEmpty()
  context: IContext;

  @Field(() => UpdateUserInput)
  @IsNotEmpty()
  input: UpdateUserInput;
}
