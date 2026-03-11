import { Field, ID, ObjectType } from '@nestjs/graphql';
import dotenv from 'dotenv';
import { ViewColumn, ViewEntity } from 'typeorm';
import { Status } from '../../enum/contract-status.enum';
import V_CONTRACTS_QUERY from '../queries/contract.view.query';

dotenv.config({ path: './.env' });

@ViewEntity(V_CONTRACTS_QUERY)
@ObjectType()
export class ContractView {
  @ViewColumn()
  @Field(() => ID, { nullable: true })
  id: string;

  @ViewColumn()
  @Field(() => ID, { nullable: true })
  lotId: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  logoProductUrl: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  productName: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  description?: string;

  @ViewColumn()
  @Field(() => Boolean, { nullable: true })
  hasAssignment?: boolean;

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
  @Field(() => String, { nullable: true })
  contractType: string;

  @ViewColumn()
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @ViewColumn()
  @Field(() => Date, { nullable: true })
  contractDate: Date;

  @ViewColumn()
  @Field(() => Date, { nullable: true })
  contractDateIni: Date;

  @ViewColumn()
  @Field(() => Date, { nullable: true })
  contractDateEnd: Date;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  contractValue: number;

  @ViewColumn()
  @Field(() => Status, { nullable: true })
  status: Status;

  @ViewColumn()
  @Field(() => ID, { nullable: true })
  organizationId: string;

  @ViewColumn()
  @Field(() => ID, { nullable: true })
  productId: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  movementsCount: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  liquidatedTotal: string;
}
