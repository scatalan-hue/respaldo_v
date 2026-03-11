import { Field, ID, ObjectType } from '@nestjs/graphql';
import dotenv from 'dotenv';
import { OneToMany, ViewColumn, ViewEntity } from 'typeorm';
import { OrganizationProduct } from '../../../organization-product/entities/organization-product.entity';
import { OrdenType } from '../../enums/organization-orden.enum';
import { V_VUDEC_ORGANIZATIONS_QUERY } from '../queries/organization.view.query';

dotenv.config({ path: './.env' });

@ViewEntity(V_VUDEC_ORGANIZATIONS_QUERY)
@ObjectType()
export class OrganizationView {
  @ViewColumn()
  @Field(() => ID, { nullable: false })
  id: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  name: string;

  @ViewColumn()
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  nit: string;

  @ViewColumn()
  @Field(() => OrdenType, { nullable: true })
  orderType: OrdenType;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  department: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  city: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  organizationParent: string;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  movementsPaidTotal: number;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  logoUrl: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  email: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  phone: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  token: string;

  @OneToMany(() => OrganizationProduct, (organizationProduct) => organizationProduct.organization, {
    lazy: true,
    nullable: true,
  })
  @Field(() => [OrganizationProduct], { nullable: true })
  organizationProducts?: OrganizationProduct[];
}
