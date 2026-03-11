import { Field, ID, ObjectType } from '@nestjs/graphql';
import dotenv from 'dotenv';
import { ViewColumn, ViewEntity } from 'typeorm';
import V_CONTRACTS_STATUS_TOTAL_QUERY from '../queries/contract-status-total.query';

dotenv.config({ path: './.env' });

@ViewEntity(V_CONTRACTS_STATUS_TOTAL_QUERY)
@ObjectType()
export class ContractStatusTotalView {
  @ViewColumn()
  @Field(() => ID, { nullable: true })
  id: string;

  @ViewColumn()
  @Field(() => ID, { nullable: true })
  organizationId: string;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  totalError: number;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  totalPending: number;

  @ViewColumn()
  @Field(() => Number, { nullable: true })
  totalSend: number;
}
