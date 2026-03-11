import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UserKeyExtraArgs {
  @Field(() => String, { nullable: true })
  credentialId?: string;

  @Field(() => String, { nullable: true })
  organizationId?: string;

  @Field(() => String, { nullable: true })
  productId?: string;

  @Field(() => String, { nullable: true })
  taxpayerId?: string;
}
