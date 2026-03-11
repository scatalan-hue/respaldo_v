import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ViewColumn, ViewEntity } from 'typeorm';
import { UserStatusTypes } from '../../enums/status-type.enum';
import { V_VUDEC_USERS_QUERY } from '../queries/user.view.query';

@ViewEntity(V_VUDEC_USERS_QUERY)
@ObjectType()
export class UserView {
  @ViewColumn()
  @Field(() => ID, { nullable: false })
  id: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  name: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  lastName: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  fullName: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  email: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  phoneNumber: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  identificationType: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  identificationNumber: string;

  @ViewColumn()
  @Field(() => UserStatusTypes, { nullable: true })
  status: UserStatusTypes;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  type: string;

  @ViewColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @ViewColumn()
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @ViewColumn()
  @Field(() => Date, { nullable: true })
  credentialsExpirationDate: Date;

  @ViewColumn()
  @Field(() => ID, { nullable: true })
  organizationId: string;
}
