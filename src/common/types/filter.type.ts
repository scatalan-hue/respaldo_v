import { Field, InputType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

@InputType()
export class Filter {
  @Field(() => GraphQLJSONObject, { nullable: true })
  and?: Record<string, string>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  like?: Record<string, string>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  or?: Record<string, string[]>;
}
