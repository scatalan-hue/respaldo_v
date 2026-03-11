import { Field, ID, ObjectType } from '@nestjs/graphql';
import dotenv from 'dotenv';
import { ViewColumn, ViewEntity } from 'typeorm';
import V_VUDEC_TAXPAYER_CONTRACTS_QUERY from '../queries/taxpayer-contracts.view.query';

dotenv.config({ path: './.env' });

@ViewEntity(V_VUDEC_TAXPAYER_CONTRACTS_QUERY)
@ObjectType()
export class TaxpayerContractsView {
  @ViewColumn()
  @Field(() => ID, { nullable: true })
  id: string;

  @ViewColumn()
  @Field(() => ID, { nullable: false })
  organizationId: string;

  @ViewColumn()
  @Field(() => ID, { nullable: false })
  productId: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  contractType: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  contractConsecutive: string;

  @ViewColumn()
  @Field(() => ID, { nullable: true })
  taxpayerId: string;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  taxpayerNumber: number;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  taxpayerName: string;

  @ViewColumn()
  @Field(() => Date, { nullable: true })
  contractDateIni: Date;

  @ViewColumn()
  @Field(() => Date, { nullable: true })
  contractDateEnd: Date;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  contractValue: number;
}
