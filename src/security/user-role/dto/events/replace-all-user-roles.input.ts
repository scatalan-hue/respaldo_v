import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';

@InputType()
export class ReplaceAllUserRolesEventInput {
  @Field(() => GraphQLJSONObject)
  @IsNotEmpty()
  context: IContext;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field(() => [String])
  @IsNotEmpty()
  @IsArray()
  roleIds: string[];
}
