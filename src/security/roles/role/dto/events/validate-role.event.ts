import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';
import { IContext } from '../../../../../patterns/crud-pattern/interfaces/context.interface';

@InputType()
export class ValidateRoleEventInput {
  @Field(() => GraphQLJSONObject)
  @IsNotEmpty()
  context: IContext;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  roleId: string;
}
