import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthResultToken {
  @Field(() => String, { nullable: true })
  credentialId: string;

  @Field(() => String, { nullable: true })
  JwtToken: string;

  @Field(() => String, { nullable: true })
  organizationId: string;

  @Field(() => String, { nullable: true })
  productId: string;

  @Field(() => String, { nullable: true })
  taxpayerId: string;
}
