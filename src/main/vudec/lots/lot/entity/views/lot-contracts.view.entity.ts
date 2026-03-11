import { Field, ObjectType } from '@nestjs/graphql';
import dotenv from 'dotenv';
import { ViewColumn, ViewEntity } from 'typeorm';
import { ContractView } from '../../../../contracts/contract/entity/views/contract.view.entity';
import V_VUDEC_LOT_CONTRACTS_QUERY from '../queries/lot-contracts.view.query';

dotenv.config({ path: './.env' });

@ViewEntity(V_VUDEC_LOT_CONTRACTS_QUERY)
@ObjectType()
export class LotContractsView extends ContractView {
  @ViewColumn()
  @Field(() => String, { nullable: true })
  lotName: string;

  @ViewColumn()
  @Field(() => String, { nullable: true })
  contractId: string;
}
