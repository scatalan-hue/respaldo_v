import { Field, ID, ObjectType } from '@nestjs/graphql';
import dotenv from 'dotenv';
import { ViewColumn, ViewEntity } from 'typeorm';
import { TypeDoc } from '../../enums/taxpayer-type.enum';
import V_VUDEC_TAXPAYERS_QUERY from '../queries/taxpayer.view.query';

dotenv.config({ path: './.env' });

@ViewEntity(V_VUDEC_TAXPAYERS_QUERY)
@ObjectType()
export class TaxpayerView {
  @ViewColumn()
  @Field(() => ID, { nullable: true })
  id: string;

  @Field(() => Number, { nullable: true })
  @ViewColumn()
  taxpayerNumber: number;

  @Field(() => ID, { nullable: true })
  @ViewColumn()
  organizationId: string;

  @Field(() => String, { nullable: true })
  @ViewColumn()
  taxpayerNumberType: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  name: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  phone: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  email: string;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  contractCount: number;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  liquidatedTotal: number;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  paidTotal: number;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  totalPayable: number;
}
